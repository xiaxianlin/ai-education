package ai_test

import (
	"context"
	"errors"
	"testing"

	"ai-education/server-go/internal/ai"
)

func TestValidateGeneratedQuestionAcceptsPromptStageImageResource(t *testing.T) {
	question := ai.GeneratedQuestion{
		QuestionTypeCode: "choice",
		Content: ai.QuestionContent{
			Stem: "看图，选择正确拼音。",
			Resource: &ai.Resource{
				Type:        "image",
				ImagePrompt: "一只可爱的小猫，卡通风格，白色背景",
			},
			Options: []ai.Option{
				{ID: "A", Text: "xiǎo gǒu"},
				{ID: "B", Text: "xiǎo māo"},
			},
		},
		Answer: ai.QuestionAnswer{
			CorrectValue: "B",
			AnalysisMode: "objective",
		},
		Difficulty: "easy",
	}

	if err := ai.ValidateGeneratedQuestion(question); err != nil {
		t.Fatalf("ValidateGeneratedQuestion returned error: %v", err)
	}
}

func TestValidateGeneratedQuestionRejectsUnknownCorrectOption(t *testing.T) {
	question := ai.GeneratedQuestion{
		QuestionTypeCode: "judge",
		Content: ai.QuestionContent{
			Stem: "太阳从西边升起。",
			Options: []ai.Option{
				{ID: "A", Text: "正确"},
				{ID: "B", Text: "错误"},
			},
		},
		Answer: ai.QuestionAnswer{
			CorrectValue: "C",
			AnalysisMode: "objective",
		},
	}

	if err := ai.ValidateGeneratedQuestion(question); !errors.Is(err, ai.ErrInvalidSchema) {
		t.Fatalf("expected ErrInvalidSchema, got %v", err)
	}
}

func TestObjectiveAnswerEvaluatorHandlesInputVariants(t *testing.T) {
	evaluator := ai.ObjectiveAnswerEvaluator{}

	result, err := evaluator.EvaluateAnswer(context.Background(), ai.EvaluateAnswerRequest{
		QuestionTypeCode: "input",
		ExpectedAnswer: ai.QuestionAnswer{
			CorrectValue: []any{"难过", "伤心", "悲伤"},
			AnalysisMode: "objective",
			Configs:      map[string]any{"full_score": 2},
		},
		StudentAnswer: " 伤心 ",
	})
	if err != nil {
		t.Fatalf("EvaluateAnswer returned error: %v", err)
	}
	if !result.IsCorrect || result.Score != 2 || result.FullScore != 2 {
		t.Fatalf("unexpected result: %+v", result)
	}
	if result.CorrectAnswer.Type != "values" {
		t.Fatalf("unexpected correct answer type: %s", result.CorrectAnswer.Type)
	}
}

func TestObjectiveAnswerEvaluatorHandlesSortingAndMatching(t *testing.T) {
	evaluator := ai.ObjectiveAnswerEvaluator{}

	sorting, err := evaluator.EvaluateAnswer(context.Background(), ai.EvaluateAnswerRequest{
		QuestionTypeCode: "sorting",
		ExpectedAnswer: ai.QuestionAnswer{
			CorrectValue: []string{"3", "1", "2"},
			AnalysisMode: "objective",
		},
		StudentAnswer: []any{"3", "1", "2"},
	})
	if err != nil {
		t.Fatalf("sorting EvaluateAnswer returned error: %v", err)
	}
	if !sorting.IsCorrect || sorting.CorrectAnswer.Type != "order" {
		t.Fatalf("unexpected sorting result: %+v", sorting)
	}

	matching, err := evaluator.EvaluateAnswer(context.Background(), ai.EvaluateAnswerRequest{
		QuestionTypeCode: "matching",
		ExpectedAnswer: ai.QuestionAnswer{
			CorrectValue: map[string]any{"L1": "R2", "L2": "R1"},
			AnalysisMode: "objective",
		},
		StudentAnswer: map[string]string{"L1": "R2", "L2": "R1"},
	})
	if err != nil {
		t.Fatalf("matching EvaluateAnswer returned error: %v", err)
	}
	if !matching.IsCorrect || matching.CorrectAnswer.Type != "mapping" {
		t.Fatalf("unexpected matching result: %+v", matching)
	}
}

func TestObjectiveAnswerEvaluatorRequiresAIForSubjective(t *testing.T) {
	evaluator := ai.ObjectiveAnswerEvaluator{}

	_, err := evaluator.EvaluateAnswer(context.Background(), ai.EvaluateAnswerRequest{
		ExpectedAnswer: ai.QuestionAnswer{
			CorrectValue: "参考答案",
			AnalysisMode: "subjective",
			Rubrics:      []ai.Rubric{{Dimension: "内容", MaxScore: 5}},
		},
		StudentAnswer: "学生答案",
	})
	if !errors.Is(err, ai.ErrRequiresAI) {
		t.Fatalf("expected ErrRequiresAI, got %v", err)
	}
}
