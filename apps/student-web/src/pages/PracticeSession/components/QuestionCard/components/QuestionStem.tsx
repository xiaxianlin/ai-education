/**
 * 题干区域组件
 * 展示题干文本（支持词汇高亮）、提示信息和资源（图片/音频）
 */
import AudioPlayer from "@/components/biz/AudioPlayer";
import { getResourceUrl } from "@ai-education/shared-web";
import { useMemo } from "react";

interface QuestionStemProps {
  question: Question;
}

/**
 * 在文本中高亮指定词汇
 */
function highlightText(text: string, words: string[]): React.ReactNode {
  if (!words || words.length === 0) return text;

  // 构建正则表达式，匹配所有需要高亮的词（忽略大小写）
  const pattern = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");

  const parts = text.split(regex);

  return parts.map((part, idx) => {
    const isHighlight = words.some((w) => w.toLowerCase() === part.toLowerCase());
    if (isHighlight) {
      return (
        <span key={idx} className="bg-yellow-200 text-yellow-900 px-0.5 rounded font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
}

export function QuestionStem({ question }: QuestionStemProps) {
  const resourceUrl =
    question?.resources && question.resources.length > 0 ? getResourceUrl(question.resources[0].url) : undefined;

  const stem = question?.stem;
  const hints = stem?.hints || [];
  const highlightWords = stem?.highlight_words || [];

  // 处理题干文本高亮
  const stemContent = useMemo(() => {
    if (stem?.rich_text) {
      // 富文本：直接渲染 HTML（暂不支持高亮）
      return <div dangerouslySetInnerHTML={{ __html: stem.rich_text }} />;
    }
    // 普通文本：应用高亮
    return highlightText(stem?.text || "", highlightWords);
  }, [stem?.rich_text, stem?.text, highlightWords]);

  return (
    <div className="flex flex-col gap-4">
      {/* 题干文本 */}
      <div className="text-lg leading-relaxed whitespace-pre-wrap text-foreground font-medium">{stemContent}</div>

      {/* 提示信息 */}
      {hints.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-700 mb-2">💡 提示</p>
          <ul className="text-sm text-blue-600 space-y-1">
            {hints.map((hint: string, idx: number) => (
              <li key={idx}>• {hint}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 图片资源 */}
      {question?.resources && question.resources.some((r) => r.type === "image") && (
        <div className="flex justify-start">
          <img
            src={resourceUrl || ""}
            alt="题目图片"
            className="max-w-full max-h-[300px] w-auto h-auto object-contain rounded-xl shadow-lg border-2 border-border"
          />
        </div>
      )}

      {/* 音频资源 */}
      {question?.resources && question.resources.some((r) => r.type === "audio") && (
        <div className="flex justify-start">
          <AudioPlayer key={resourceUrl} src={resourceUrl || ""} />
        </div>
      )}
    </div>
  );
}
