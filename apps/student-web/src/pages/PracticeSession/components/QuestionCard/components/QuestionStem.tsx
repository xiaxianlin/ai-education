/**
 * 题干区域组件
 * 展示题干文本和资源（图片/音频）
 */
import AudioPlayer from "@/components/biz/AudioPlayer";
import { getResourceUrl } from "@ai-education/shared-web";

interface QuestionStemProps {
  question: Question;
}

export function QuestionStem({ question }: QuestionStemProps) {
  const resourceUrl =
    question?.resources && question.resources.length > 0 ? getResourceUrl(question.resources[0].url) : undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* 题干文本 */}
      <div className="text-lg leading-relaxed whitespace-pre-wrap text-foreground font-medium">
        {question?.stem?.rich_text ? (
          <div dangerouslySetInnerHTML={{ __html: question.stem.rich_text }} />
        ) : (
          question?.stem?.text || ""
        )}
      </div>

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
