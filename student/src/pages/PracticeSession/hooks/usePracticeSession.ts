/**
 * 通用练习会话 Hook
 * 管理练习会话的状态、答题、提交等功能
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { practiceApi } from "@/services/practice";
import { toast } from "sonner";
import type {
  PracticeSession,
  PracticeSessionStatus,
  Question,
} from "@/lib/types/schema";

export function usePracticeSession(sessionId: number) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
  // answerStatus: 0-未答, 1-正确, 2-错误
  const [answerStatus, setAnswerStatus] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);

      // 获取会话详情
      const detail = await practiceApi.getSessionDetail(sessionId);
      setSession(detail.session);

      // 如果有题目列表，设置题目
      if (detail.questions && detail.questions.length > 0) {
        setQuestions(detail.questions);

        // 恢复已提交的答案
        if (detail.answers && detail.answers.length > 0) {
          const restoredAnswers: Record<number, string> = {};
          const restoredStatus: Record<number, number> = {};

          detail.answers.forEach((answer: any) => {
            if (answer.text_answer) {
              restoredAnswers[answer.question_id] = answer.text_answer;
            }
            // status: 0-未答, 1-正确, 2-错误
            if (answer.status !== undefined) {
              restoredStatus[answer.question_id] = answer.status;
            }
          });

          setUserAnswers(restoredAnswers);
          setAnswerStatus(restoredStatus);

          // 找到第一个未回答的题目（status === 0）
          const firstUnansweredIndex = detail.questions.findIndex(
            (q: Question) =>
              restoredStatus[q.id] === undefined || restoredStatus[q.id] === 0
          );
          if (firstUnansweredIndex !== -1) {
            setCurrentQuestionIndex(firstUnansweredIndex);
          }
        }
      }

      // 如果有报告，说明练习已完成
      if (detail.report) {
        setReport(detail.report);
      }

      setStartTime(Date.now());
    } catch (error) {
      console.error("Failed to load session:", error);
      const errorMessage =
        error instanceof Error ? error.message : "加载练习失败";
      toast.error(errorMessage);
      navigate({ to: "/home" });
    } finally {
      setLoading(false);
    }
  };

  const handleBegin = async () => {
    if (!session) return;

    try {
      await practiceApi.beginPractice(session.id);

      // 重新加载会话以获取最新状态
      await loadSession();

      toast.success("练习已开始！");
    } catch (error) {
      console.error("Failed to begin practice:", error);
      const errorMessage =
        error instanceof Error ? error.message : "开始练习失败";
      toast.error(errorMessage);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  // 统计已答题数量（status !== 0 且 status !== undefined）
  const answeredCount = Object.values(answerStatus).filter(
    (status) => status !== undefined && status !== 0
  ).length;

  const handleAnswerChange = useCallback(
    (answer: string, audioUrl?: string) => {
      if (!currentQuestion) return;
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));
      if (audioUrl) {
        setAudioUrls((prev) => ({
          ...prev,
          [currentQuestion.id]: audioUrl,
        }));
      }
    },
    [currentQuestion]
  );

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || !session) return;

    const answer = userAnswers[currentQuestion.id];
    const audioUrl = audioUrls[currentQuestion.id];

    // 对于口语题，必须有录音文件
    if (currentQuestion.type === "口语题" && !audioUrl) {
      toast.error("请先录音");
      return;
    }

    // 对于其他题型，必须有答案
    if (currentQuestion.type !== "口语题" && !answer) {
      toast.error("请先选择答案");
      return;
    }

    try {
      setSubmitting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // 如果是音频答案，需要转换为 base64
      let audioData: string | undefined;
      if (audioUrl && currentQuestion.type === "口语题") {
        try {
          // 如果 audioUrl 已经是纯 base64 格式（不包含 data: 前缀），直接使用
          if (!audioUrl.startsWith("http") && !audioUrl.startsWith("data:")) {
            audioData = audioUrl;
          } else if (audioUrl.startsWith("data:")) {
            // 如果是 data URL 格式，提取 base64 部分
            audioData = audioUrl.split(",")[1];
          } else {
            // 从 URL 获取音频数据并转换为 base64
            const response = await fetch(audioUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            audioData = await new Promise<string>((resolve, reject) => {
              reader.onloadend = () => {
                const base64 = reader.result as string;
                resolve(base64.split(",")[1]); // 移除 data:audio/...;base64, 前缀
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        } catch (error) {
          console.error("Failed to convert audio to base64:", error);
          toast.error("音频处理失败");
          return;
        }
      }

      const submitParams = {
        session_id: session.id,
        question_id: currentQuestion.id,
        answer: answer || "",
        time_spent: timeSpent,
        is_audio_answer: !!audioData,
        audio_data: audioData,
      };
      
      console.log('[DEBUG] Submitting answer with params:', {
        ...submitParams,
        audio_data: submitParams.audio_data ? `[${submitParams.audio_data.length} chars]` : undefined
      });
      
      const result = await practiceApi.submitAnswer(submitParams);

      // 根据 is_correct 设置 status: 1-正确, 2-错误
      setAnswerStatus((prev) => ({
        ...prev,
        [currentQuestion.id]: result.is_correct ? 1 : 2,
      }));

      // 更新会话状态
      if (session) {
        setSession({
          ...session,
          answer_count: result.session_progress.answer_count,
          correct_count: result.session_progress.correct_count,
          status: result.session_progress.status as PracticeSessionStatus,
        });
      }

      toast.success(result.is_correct ? "回答正确！" : "回答错误");

      // 重置开始时间
      setStartTime(Date.now());
    } catch (error) {
      console.error("Failed to submit answer:", error);
      const errorMessage =
        error instanceof Error ? error.message : "提交答案失败";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [currentQuestion, session, userAnswers, audioUrls, startTime]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setStartTime(Date.now());
    }
  }, [currentQuestionIndex]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setStartTime(Date.now());
    }
  }, [currentQuestionIndex, totalQuestions]);

  const handleComplete = async () => {
    if (!session) return;

    try {
      setSubmitting(true);
      const result = await practiceApi.completePractice(session.id);

      toast.success("练习已完成！");

      // 导航到结果页
      navigate({ to: `/practice-result/${session.id}` });
    } catch (error) {
      console.error("Failed to complete practice:", error);
      const errorMessage =
        error instanceof Error ? error.message : "完成练习失败";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    session,
    questions,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    answeredCount,
    userAnswers,
    audioUrls,
    answerStatus,
    submitting,
    report,
    handleAnswerChange,
    handleSubmitAnswer,
    goToPreviousQuestion,
    goToNextQuestion,
    handleComplete,
    handleBegin,
  };
}
