package practice

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"

	"ai-education/server-go/internal/ai"
	"ai-education/server-go/internal/queue"
)

type Queue interface {
	Enqueue(ctx context.Context, task queue.Task) (queue.TaskReceipt, error)
}

type AnswerEvaluator interface {
	EvaluateAnswer(ctx ai.Context, req ai.EvaluateAnswerRequest) (ai.EvaluateAnswerResult, error)
}

type ReportGenerator interface {
	GenerateReport(ctx ai.Context, req ai.GenerateReportRequest) (ai.PracticeReportDraft, error)
}

type Service struct {
	repo            Repository
	queue           Queue
	evaluator       AnswerEvaluator
	reportGenerator ReportGenerator
}

func NewService(repo Repository, enqueuer Queue, evaluator AnswerEvaluator, reportGenerator ...ReportGenerator) *Service {
	if repo == nil {
		repo = NewMemoryRepository()
	}
	if enqueuer == nil {
		enqueuer = queue.NewNoopEnqueuer()
	}
	if evaluator == nil {
		evaluator = NoopAnswerEvaluator{}
	}
	svc := &Service{repo: repo, queue: enqueuer, evaluator: evaluator}
	if len(reportGenerator) > 0 && reportGenerator[0] != nil {
		svc.reportGenerator = reportGenerator[0]
	}
	return svc
}

func (s *Service) Create(ctx context.Context, studentID string, req CreatePracticeRequest) (CreatePracticeResponse, error) {
	if studentID == "" {
		return CreatePracticeResponse{}, newValidationError("student_id 不能为空")
	}

	normalized, err := normalizeCreateRequest(req)
	if err != nil {
		return CreatePracticeResponse{}, err
	}

	now := unixNow()
	session := Practice{
		ID:             newSessionID(),
		StudentID:      studentID,
		PracticeType:   normalized.Type,
		Subject:        normalized.Subject,
		Grade:          normalized.Grade,
		AbilityCode:    normalized.AbilityCode,
		UnitID:         normalized.UnitID,
		Status:         PracticeStatusNotStarted,
		GenerateStatus: GenerateStatusGenerating,
		StartTime:      now,
		CreateTime:     now,
		UpdateTime:     now,
	}

	session, err = s.repo.CreatePractice(ctx, session)
	if err != nil {
		return CreatePracticeResponse{}, err
	}

	task, err := queue.NewPracticeGenerateTask(queue.PracticeGeneratePayload{
		SessionID:     session.ID,
		GenerateCount: normalized.GenerateCount,
	})
	if err != nil {
		return CreatePracticeResponse{}, err
	}
	if _, err := s.queue.Enqueue(ctx, task); err != nil {
		return CreatePracticeResponse{}, err
	}

	return CreatePracticeResponse{
		SessionID: session.ID,
		Message:   "练习会话创建成功，正在生成题目",
	}, nil
}

func (s *Service) Get(ctx context.Context, studentID string, practiceType string, abilityCode string, unitID int64) (*Practice, error) {
	if studentID == "" {
		return nil, newValidationError("student_id 不能为空")
	}
	if practiceType != PracticeTypeAbility && practiceType != PracticeTypeUnit {
		return nil, newValidationError("无效的练习类型")
	}
	if practiceType == PracticeTypeAbility && abilityCode == "" {
		return nil, newValidationError("能力练习需要提供 ability_code")
	}
	if practiceType == PracticeTypeUnit && unitID <= 0 {
		return nil, newValidationError("单元练习需要提供 unit_id")
	}
	return s.repo.GetOpenPractice(ctx, studentID, practiceType, abilityCode, unitID)
}

func (s *Service) Records(ctx context.Context, params PracticeListParams) (PracticeListResult, error) {
	if params.StudentID == "" {
		return PracticeListResult{}, newValidationError("student_id 不能为空")
	}
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	if params.PageSize > 100 {
		return PracticeListResult{}, newValidationError("page_size 不能大于 100")
	}
	return s.repo.ListPractices(ctx, params)
}

func (s *Service) PersistGeneratedPractice(ctx context.Context, req PersistGeneratedPracticeRequest) (PersistGeneratedPracticeResult, error) {
	if req.SessionID == "" {
		return PersistGeneratedPracticeResult{}, newValidationError("session_id 不能为空")
	}

	session, err := s.repo.GetPracticeByID(ctx, req.SessionID)
	if err != nil {
		return PersistGeneratedPracticeResult{}, err
	}
	if session.Status != PracticeStatusNotStarted {
		return PersistGeneratedPracticeResult{}, newConflictError("只能在练习开始前写入生成题目")
	}

	questions, err := normalizeGeneratedQuestions(*session, req.Questions)
	if err != nil {
		return PersistGeneratedPracticeResult{}, err
	}

	updated, err := s.repo.PersistGeneratedPractice(ctx, req.SessionID, questions, req.GenerateTime)
	if err != nil {
		return PersistGeneratedPracticeResult{}, err
	}
	return PersistGeneratedPracticeResult{
		Session:       updated,
		QuestionCount: len(questions),
	}, nil
}

func (s *Service) Detail(ctx context.Context, studentID string, sessionID string) (PracticeData, error) {
	if sessionID == "" {
		return PracticeData{}, newValidationError("session_id 不能为空")
	}
	return s.repo.GetPracticeData(ctx, studentID, sessionID)
}

func (s *Service) Begin(ctx context.Context, studentID string, sessionID string) error {
	session, err := s.mustGetPractice(ctx, studentID, sessionID)
	if err != nil {
		return err
	}
	if err := ensureGenerationReady(*session); err != nil {
		return err
	}

	switch session.Status {
	case PracticeStatusNotStarted:
		now := unixNow()
		session.Status = PracticeStatusInProgress
		session.StartTime = now
		session.UpdateTime = now
		return s.repo.UpdatePractice(ctx, *session)
	case PracticeStatusInProgress:
		return nil
	case PracticeStatusCompleted, PracticeStatusAbandoned:
		return newConflictError("练习已完成或已废弃")
	default:
		return newConflictError("练习状态异常")
	}
}

func (s *Service) Complete(ctx context.Context, studentID string, sessionID string) (int64, error) {
	session, err := s.mustGetPractice(ctx, studentID, sessionID)
	if err != nil {
		return 0, err
	}
	if err := ensureGenerationReady(*session); err != nil {
		return 0, err
	}
	if session.Status == PracticeStatusCompleted {
		return 0, newConflictError("练习已完成")
	}
	if session.Status == PracticeStatusAbandoned {
		return 0, newConflictError("练习已废弃")
	}
	if session.AnswerCount < session.QuestionCount {
		return 0, newConflictError(fmt.Sprintf("练习未完成所有题目: 已答=%d, 总数=%d", session.AnswerCount, session.QuestionCount))
	}

	now := unixNow()
	session.Status = PracticeStatusCompleted
	session.EndTime = &now
	session.UpdateTime = now
	if err := s.repo.UpdatePractice(ctx, *session); err != nil {
		return 0, err
	}

	report := buildReport(*session, now)
	created, err := s.repo.CreateReport(ctx, report)
	if err != nil {
		return 0, err
	}

	// 入队 AI 报告生成任务（失败不影响主流程）
	if s.reportGenerator != nil && s.queue != nil {
		task, taskErr := queue.NewReportGenerateTask(queue.ReportGeneratePayload{
			SessionID: sessionID,
			StudentID: studentID,
		})
		if taskErr != nil {
			log.Printf("WARN: [session_id=%s] 构建 report.generate 任务失败: %v", sessionID, taskErr)
		} else if _, enqueueErr := s.queue.Enqueue(ctx, task); enqueueErr != nil {
			log.Printf("WARN: [session_id=%s] 入队 report.generate 任务失败: %v", sessionID, enqueueErr)
		}
	}

	return created.ID, nil
}

func (s *Service) SubmitAnswer(ctx context.Context, studentID string, req SubmitAnswerRequest) (PracticeAnswer, error) {
	if req.SessionID == "" || req.QuestionID == "" {
		return PracticeAnswer{}, newValidationError("session_id 和 question_id 不能为空")
	}
	if req.TimeSpent < 0 {
		return PracticeAnswer{}, newValidationError("time_spent 不能小于 0")
	}

	session, err := s.mustGetPractice(ctx, studentID, req.SessionID)
	if err != nil {
		return PracticeAnswer{}, err
	}
	if err := ensureGenerationReady(*session); err != nil {
		return PracticeAnswer{}, err
	}
	if session.Status == PracticeStatusCompleted || session.Status == PracticeStatusAbandoned {
		return PracticeAnswer{}, newConflictError("练习已完成或已废弃")
	}

	answer, err := s.repo.GetAnswer(ctx, studentID, req.SessionID, req.QuestionID)
	if err != nil {
		return PracticeAnswer{}, err
	}
	if answer.Status != AnswerStatusUnanswered {
		return PracticeAnswer{}, newConflictError("答题记录已提交")
	}
	if answer.Question == nil {
		return PracticeAnswer{}, newConflictError("题目信息缺失，无法评判答案")
	}

	result, err := s.evaluator.EvaluateAnswer(ctx, ai.EvaluateAnswerRequest{
		SessionID:        req.SessionID,
		QuestionID:       req.QuestionID,
		QuestionTypeCode: answer.Question.QuestionTypeCode,
		Content:          answer.Question.Content,
		ExpectedAnswer:   answer.Question.Answer,
		StudentAnswer:    req.Answer,
		AudioURL:         req.AudioURL,
	})
	if err != nil {
		return PracticeAnswer{}, err
	}

	now := unixNow()
	answer.Answer = req.Answer
	answer.AudioURL = req.AudioURL
	answer.TimeSpent = req.TimeSpent
	answer.SubmitTime = &now
	answer.UpdateTime = now
	answer.CorrectAnswer = &result.CorrectAnswer
	answer.Analysis = &result.Analysis
	if result.IsCorrect {
		answer.Status = AnswerStatusCorrect
		session.CorrectCount++
	} else {
		answer.Status = AnswerStatusIncorrect
	}
	session.AnswerCount++
	session.UpdateTime = now

	if err := s.repo.UpdateAnswer(ctx, *answer); err != nil {
		return PracticeAnswer{}, err
	}
	if err := s.repo.UpdatePractice(ctx, *session); err != nil {
		return PracticeAnswer{}, err
	}
	return *answer, nil
}

func (s *Service) Progress(ctx context.Context, studentID string, sessionID string) (ProgressResponse, error) {
	session, err := s.mustGetPractice(ctx, studentID, sessionID)
	if err != nil {
		return ProgressResponse{}, err
	}
	state := ResolveState(*session)
	return ProgressResponse{
		Progress: state.Progress,
		Step:     state.Step,
		Message:  state.Message,
	}, nil
}

func (s *Service) mustGetPractice(ctx context.Context, studentID string, sessionID string) (*Practice, error) {
	if studentID == "" {
		return nil, newValidationError("student_id 不能为空")
	}
	if sessionID == "" {
		return nil, newValidationError("session_id 不能为空")
	}
	return s.repo.GetPractice(ctx, studentID, sessionID)
}

func normalizeCreateRequest(req CreatePracticeRequest) (CreatePracticeRequest, error) {
	if req.GenerateCount == 0 {
		req.GenerateCount = queue.DefaultPracticeGenerateCount
	}
	if req.GenerateCount < 1 || req.GenerateCount > 50 {
		return CreatePracticeRequest{}, newValidationError("generate_count 必须在 1 到 50 之间")
	}

	switch req.Type {
	case PracticeTypeAbility:
		if req.AbilityCode == "" {
			return CreatePracticeRequest{}, newValidationError("能力练习需要提供 ability_code")
		}
		if req.Subject == "" {
			return CreatePracticeRequest{}, newValidationError("能力练习需要提供 subject")
		}
		if req.Grade <= 0 {
			return CreatePracticeRequest{}, newValidationError("能力练习需要提供 grade")
		}
	case PracticeTypeUnit:
		if req.UnitID <= 0 {
			return CreatePracticeRequest{}, newValidationError("单元练习需要提供 unit_id")
		}
	default:
		return CreatePracticeRequest{}, newValidationError("无效的练习类型")
	}
	return req, nil
}

func normalizeGeneratedQuestions(session Practice, questions []ai.GeneratedQuestion) ([]ai.GeneratedQuestion, error) {
	if len(questions) == 0 {
		return nil, newValidationError("生成题目不能为空")
	}

	normalized := make([]ai.GeneratedQuestion, len(questions))
	seenIDs := map[string]struct{}{}
	for index, question := range questions {
		if question.ID == "" {
			question.ID = newSessionID()
		}
		if question.Subject == "" {
			question.Subject = session.Subject
		}
		if question.Grade == 0 {
			question.Grade = session.Grade
		}
		if _, ok := seenIDs[question.ID]; ok {
			return nil, newValidationError("生成题目 ID 不能重复")
		}
		seenIDs[question.ID] = struct{}{}
		normalized[index] = question
	}
	if err := ai.ValidateGeneratedQuestions(normalized); err != nil {
		return nil, err
	}
	return normalized, nil
}

func ensureGenerationReady(session Practice) error {
	switch session.GenerateStatus {
	case GenerateStatusGenerating:
		return newConflictError("练习正在生成中，请稍候")
	case GenerateStatusFailed:
		return newConflictError("练习生成失败，请重新生成")
	case GenerateStatusCompleted:
		return nil
	default:
		return newConflictError("练习生成状态异常")
	}
}

func buildReport(session Practice, now int64) PracticeReport {
	overallScore := 0.0
	if session.QuestionCount > 0 {
		overallScore = float64(session.CorrectCount) / float64(session.QuestionCount) * 100
	}
	totalTime := 0
	if session.EndTime != nil && session.StartTime > 0 {
		totalTime = int(*session.EndTime - session.StartTime)
		if totalTime < 0 {
			totalTime = 0
		}
	}
	return PracticeReport{
		SessionID:            session.ID,
		StudentID:            session.StudentID,
		TotalQuestions:       session.QuestionCount,
		CorrectQuestions:     session.CorrectCount,
		TotalTime:            totalTime,
		OverallScore:         overallScore,
		KnowledgeScores:      JSONMap{},
		QuestionDistribution: JSONMap{},
		AbilityBreakdown:     JSONMap{},
		Strengths:            []string{},
		Weaknesses:           []string{},
		Recommendations:      []string{},
		CreateTime:           now,
	}
}

// HandleReportGenerate 处理 AI 报告生成任务
func (s *Service) HandleReportGenerate(ctx context.Context, payload queue.ReportGeneratePayload) error {
	if payload.SessionID == "" {
		return newValidationError("session_id 不能为空")
	}
	if payload.StudentID == "" {
		return newValidationError("student_id 不能为空")
	}
	if s.reportGenerator == nil {
		return fmt.Errorf("report generator not configured")
	}

	// 1. 获取练习会话并校验状态
	session, err := s.repo.GetPracticeByID(ctx, payload.SessionID)
	if err != nil {
		return fmt.Errorf("获取练习失败: %w", err)
	}
	if session.StudentID != payload.StudentID {
		return fmt.Errorf("学生 ID 不匹配: session=%s, payload=%s", session.StudentID, payload.StudentID)
	}
	if session.Status != PracticeStatusCompleted {
		return fmt.Errorf("练习未完成，跳过报告生成: status=%d", session.Status)
	}

	// 2. 获取练习数据（含答案）
	data, err := s.repo.GetPracticeData(ctx, payload.StudentID, payload.SessionID)
	if err != nil {
		return fmt.Errorf("获取练习数据失败: %w", err)
	}

	// 3. 收集答案结果用于 AI 分析
	answerResults := make([]ai.EvaluateAnswerResult, 0, len(data.Answers))
	for _, ans := range data.Answers {
		result := ai.EvaluateAnswerResult{
			IsCorrect: ans.Status == AnswerStatusCorrect,
		}
		if ans.Analysis != nil {
			result.Analysis = *ans.Analysis
		}
		answerResults = append(answerResults, result)
	}

	totalTime := 0
	if session.EndTime != nil && session.StartTime > 0 {
		totalTime = int(*session.EndTime - session.StartTime)
		if totalTime < 0 {
			totalTime = 0
		}
	}

	// 4. 调用 AI 生成报告
	draft, err := s.reportGenerator.GenerateReport(ctx, ai.GenerateReportRequest{
		SessionID:     payload.SessionID,
		StudentID:     payload.StudentID,
		Subject:       session.Subject,
		Grade:         session.Grade,
		PracticeType:  session.PracticeType,
		Answers:       answerResults,
		TotalTimeSecs: totalTime,
	})
	if err != nil {
		return fmt.Errorf("AI 报告生成失败: %w", err)
	}

	// 5. 更新报告
	report := PracticeReport{
		SessionID:            payload.SessionID,
		StudentID:            payload.StudentID,
		TotalQuestions:       session.QuestionCount,
		CorrectQuestions:     session.CorrectCount,
		TotalTime:            totalTime,
		OverallScore:         draft.OverallScore,
		CurrentAbility:       draft.CurrentAbility,
		Confidence:           draft.Confidence,
		AbilityLevel:         draft.AbilityLevel,
		Percentile:           draft.Percentile,
		KnowledgeScores:      JSONMap(draft.KnowledgeScores),
		QuestionDistribution: JSONMap(draft.QuestionDistribution),
		AbilityBreakdown:     JSONMap(draft.AbilityBreakdown),
		LearningSpeed:        draft.LearningSpeed,
		Consistency:          draft.Consistency,
		Strengths:            draft.Strengths,
		Weaknesses:           draft.Weaknesses,
		Recommendations:      draft.Recommendations,
	}
	return s.repo.UpdateReport(ctx, report)
}

func newSessionID() string {
	var bytes [16]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return fmt.Sprintf("session-%d", unixNow())
	}
	bytes[6] = (bytes[6] & 0x0f) | 0x40
	bytes[8] = (bytes[8] & 0x3f) | 0x80
	encoded := hex.EncodeToString(bytes[:])
	return fmt.Sprintf("%s-%s-%s-%s-%s", encoded[0:8], encoded[8:12], encoded[12:16], encoded[16:20], encoded[20:32])
}

type NoopAnswerEvaluator struct{}

func (NoopAnswerEvaluator) EvaluateAnswer(ctx ai.Context, req ai.EvaluateAnswerRequest) (ai.EvaluateAnswerResult, error) {
	if err := ctx.Err(); err != nil {
		return ai.EvaluateAnswerResult{}, err
	}
	correctValue := req.ExpectedAnswer.CorrectValue
	if correctValue == nil {
		correctValue = req.ExpectedAnswer.Value
	}
	fullScore := 1.0
	score := 0.0
	isCorrect := false
	if fmt.Sprint(req.StudentAnswer) == fmt.Sprint(correctValue) {
		isCorrect = true
		score = fullScore
	}
	return ai.EvaluateAnswerResult{
		IsCorrect: isCorrect,
		Score:     score,
		FullScore: fullScore,
		CorrectAnswer: ai.CorrectAnswer{
			Type:  "value",
			Value: correctValue,
		},
		Analysis: ai.AnswerAnalysis{
			CorrectAnswer: correctValue,
			Explanation:   req.ExpectedAnswer.Explanation,
		},
	}, nil
}
