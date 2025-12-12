import { Button } from "@/components/ui/button";
import { Lightbulb, Play, Loader2, Sparkles, FileText } from "lucide-react";
import { useUnitPractice } from "../../hooks/useUnitPractice";
import { PracticeStatus } from "../../../constants";
import { useMemo, ReactNode } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { useNavigate } from "react-router-dom";
import { usePageModel } from "../../models/PageModel";

export interface PracticeCardProps {
  unit: Unit;
  textbook: Textbook;
}

interface ButtonConfig {
  key: string;
  label: string;
  icon: ReactNode;
  variant: "default" | "outline";
  onClick: () => void;
  className?: string;
}

export function PracticeCard({ unit, textbook }: PracticeCardProps) {
  const { practice, status, loading, visible, showConfirmModal, hideConfirmModal, createPractice } = useUnitPractice(
    unit,
    textbook,
  );
  const navigate = useNavigate();
  const { openKnowledgeModal } = usePageModel();

  // 计算 emoji 图标
  const emoji = useMemo(() => {
    switch (status) {
      case PracticeStatus.WAIT:
        return "✨";
      case PracticeStatus.GENERATING:
        return "⏳";
      case PracticeStatus.READY:
        return "✨";
      case PracticeStatus.PRACTICING:
        return "📝";
      case PracticeStatus.COMPLETED:
        return "🎉";
      default:
        return "✨";
    }
  }, [status]);

  // 计算 content
  const content = useMemo<ReactNode>(() => {
    switch (status) {
      case PracticeStatus.WAIT:
        return (
          <p className="text-base text-muted-foreground text-center">
            {unit.content || "本单元包含多个重点知识点，快来挑战吧！"}
          </p>
        );
      case PracticeStatus.GENERATING:
        return <p className="text-base text-muted-foreground text-center">AI 正在为你精心准备练习题目，请稍候片刻～</p>;
      case PracticeStatus.READY:
      case PracticeStatus.PRACTICING:
        const isInProgress = practice?.status === 1;
        return (
          <div className="text-center space-y-2">
            <p className="text-base text-muted-foreground">
              {isInProgress ? "正在练习中，随时可以继续完成剩余题目。" : "练习已准备完成，随时可以开始答题。"}
            </p>
            <p className="text-base text-muted-foreground font-medium">
              ✨ 已完成 {practice?.answer_count}/{practice?.question_count} 题 · 正确 {practice?.correct_count} 题
            </p>
          </div>
        );
      case PracticeStatus.COMPLETED:
        return (
          <div className="text-center space-y-2">
            <p className="text-base text-muted-foreground">本单元练习已完成，查看报告或重新生成新练习。</p>
            <p className="text-base text-muted-foreground font-medium">
              ✨ 已完成 {practice?.answer_count}/{practice?.question_count} 题 · 正确 {practice?.correct_count} 题
            </p>
          </div>
        );
      default:
        return null;
    }
  }, [status, unit.content, practice]);

  // 计算按钮配置
  const buttons = useMemo<ButtonConfig[]>(() => {
    const buttonList: ButtonConfig[] = [];

    // 查看知识点按钮（WAIT, READY/PRACTICING, COMPLETED 显示）
    if (
      status === PracticeStatus.WAIT ||
      status === PracticeStatus.READY ||
      status === PracticeStatus.PRACTICING ||
      status === PracticeStatus.COMPLETED
    ) {
      buttonList.push({
        key: "knowledge",
        label: "查看知识点",
        icon: <Lightbulb className="h-5 w-5 mr-2" />,
        variant: "outline",
        onClick: () => openKnowledgeModal(unit),
        className: "flex-1 h-14 rounded-2xl text-base font-semibold transition-all",
      });
    }

    // 开始练习/继续练习按钮（WAIT, READY/PRACTICING 显示）
    if (status === PracticeStatus.WAIT) {
      buttonList.push({
        key: "start",
        label: "开始练习",
        icon: <Play className="h-5 w-5 mr-2" fill="currentColor" />,
        variant: "default",
        onClick: () => showConfirmModal(),
        className:
          "flex-1 h-14 rounded-2xl text-base font-semibold transition-all text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl",
      });
    } else if (status === PracticeStatus.READY || status === PracticeStatus.PRACTICING) {
      if (practice) {
        const isInProgress = practice.status === 1;
        buttonList.push({
          key: "continue",
          label: isInProgress ? "继续练习" : "开始练习",
          icon: <Play className="h-5 w-5 mr-2" fill="currentColor" />,
          variant: "default",
          onClick: () => navigate(`/practice/session/${practice.id}`),
          className:
            "flex-1 h-14 rounded-2xl text-base font-semibold transition-all text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl",
        });
      }
    }

    // 生成练习按钮（COMPLETED 显示）
    if (status === PracticeStatus.COMPLETED) {
      buttonList.push({
        key: "create",
        label: "生成练习",
        icon: <Sparkles className="h-5 w-5 mr-2" />,
        variant: "outline",
        onClick: () => showConfirmModal(),
        className: "flex-1 h-14 rounded-2xl text-base font-semibold transition-all",
      });
    }

    // 查看报告按钮（COMPLETED 显示）
    if (status === PracticeStatus.COMPLETED) {
      buttonList.push({
        key: "report",
        label: "查看报告",
        icon: <FileText className="h-5 w-5 mr-2" />,
        variant: "default",
        onClick: () => navigate(`/practice/session/${practice?.id}`),
        className:
          "flex-1 h-14 rounded-2xl text-base font-semibold transition-all text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl",
      });
    }

    return buttonList;
  }, [status, practice, unit, navigate, showConfirmModal, openKnowledgeModal]);

  // 计算卡片样式
  const cardClassName = useMemo(() => {
    const baseClass = "relative overflow-hidden rounded-3xl shadow-xl border-2 transition-all";
    if (status === PracticeStatus.PRACTICING || status === PracticeStatus.READY) {
      return `${baseClass} bg-accent/10 border-accent/40 hover:border-accent/60`;
    }
    return `${baseClass} bg-card border-primary/20 hover:border-primary/40`;
  }, [status]);

  return (
    <>
      <div className={cardClassName}>
        <div className="relative p-8 flex flex-col h-full mb-8">
          {/* 内容区域 */}
          <div className="flex-1 flex flex-col gap-6">
            {/* 标题和图标 */}
            <div className="flex items-center justify-center gap-2">
              <div className="text-4xl">{emoji}</div>
              <h3 className="text-2xl font-bold text-foreground">{unit.name}</h3>
            </div>
            {/* 内容文本 */}
            {content}
          </div>

          {/* 操作按钮区域 */}
          {status === PracticeStatus.GENERATING ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-base font-medium text-primary">正在生成练习</span>
            </div>
          ) : (
            <div className="flex gap-3">
              {buttons.map((button) => (
                <Button
                  key={button.key}
                  variant={button.variant}
                  size="lg"
                  className={button.className}
                  onClick={button.onClick}
                >
                  {button.icon}
                  {button.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        unit={unit}
        loading={loading}
        visible={visible}
        onConfirm={createPractice}
        onCancel={hideConfirmModal}
      />
    </>
  );
}
