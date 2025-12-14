/**
 * 练习记录详情页面
 * 显示单个练习会话的详细信息，包括题目、答案和报告
 */
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRequest } from "ahooks";
import { studentApi } from "@/lib/api";
import { QuestionAnswerCard } from "./components/QuestionAnswerCard";
import { ReportSummary } from "./components/ReportSummary";
import { formatDateTime } from "@ai-education/shared-web";
import { ArrowLeft, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 获取练习类型名称
 */
function getPracticeTypeName(type: PracticeType): string {
  switch (type) {
    case "daily_practice":
      return "每日练习";
    case "unit_practice":
      return "单元练习";
    case "assessment":
      return "能力评测";
    default:
      return "练习";
  }
}

/**
 * 获取状态文本和样式
 */
function getStatusInfo(status: PracticeSessionStatus) {
  switch (status) {
    case 0:
      return { text: "未开始", variant: "outline" as const };
    case 1:
      return { text: "进行中", variant: "secondary" as const };
    case 2:
      return { text: "已完成", variant: "default" as const };
    default:
      return { text: "未知", variant: "outline" as const };
  }
}

export default function PracticeDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const sessionIdNum = sessionId ? parseInt(sessionId, 10) : 0;

  const {
    data: detail,
    loading,
    error,
  } = useRequest(() => studentApi.getSessionDetail(sessionIdNum), {
    ready: !!sessionIdNum,
    refreshDeps: [sessionIdNum],
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-border">
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-2 border-border">
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <Card className="border-2 border-destructive/20">
        <CardContent className="py-10 px-6 text-center space-y-3">
          <div className="text-5xl">❌</div>
          <p className="text-xl font-bold text-foreground">加载失败</p>
          <p className="text-sm text-muted-foreground">{error?.message || "无法加载练习详情"}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            返回
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { session, questions, answers, report } = detail;
  const statusInfo = getStatusInfo(session.status);
  const isCompleted = session.status === 2;
  const isInProgress = session.status === 1;

  // 创建答案映射，方便查找
  const answerMap = new Map<string, PracticeAnswer>();
  answers?.forEach((answer) => {
    answerMap.set(answer.question_id, answer);
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    navigate(`/practice/session/${session.id}`);
  };

  return (
    <div className="space-y-6">
      {/* 返回按钮和基本信息 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
      </div>

      {/* 会话基本信息 */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{getPracticeTypeName(session.session_type)}</h1>
                <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
              </div>
              {!isCompleted && (
                <Button onClick={handleContinue}>
                  <Play className="h-4 w-4 mr-2" />
                  继续练习
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">总题数</div>
                <div className="text-lg font-semibold text-foreground">{session.question_count}</div>
              </div>
              <div>
                <div className="text-muted-foreground">已答题</div>
                <div className="text-lg font-semibold text-primary">{session.answer_count}</div>
              </div>
              <div>
                <div className="text-muted-foreground">正确数</div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">{session.correct_count}</div>
              </div>
              <div>
                <div className="text-muted-foreground">
                  {isCompleted ? "完成时间" : isInProgress ? "开始时间" : "创建时间"}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {formatDateTime(session.end_time || session.start_time || session.create_time)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 报告摘要（如果已完成） */}
      {isCompleted && report && <ReportSummary report={report} sessionType={session.session_type} />}

      {/* 题目列表 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">题目详情</h2>
        {questions.length === 0 ? (
          <Card className="border-2 border-accent/50 bg-accent/10">
            <CardContent className="py-10 px-6 text-center space-y-3">
              <div className="text-5xl">📝</div>
              <p className="text-xl font-bold text-foreground">暂无题目</p>
              <p className="text-sm text-muted-foreground">该练习还没有题目</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map((question, index) => {
              const answer = answerMap.get(question.id);
              return <QuestionAnswerCard key={question.id} question={question} answer={answer} index={index} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
