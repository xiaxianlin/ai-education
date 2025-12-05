/**
 * 题目资源组件 - 显示图片或音频
 */
import { FC, memo } from "react";
import { getResourceUrl } from "@/lib/resource";
import AudioPlayer from "@/components/business/AudioPlayer";

interface QuestionResourceProps {
  resource?: string;
  resourceType?: string | null;
}

export const QuestionResource: FC<QuestionResourceProps> = memo(
  ({ resource, resourceType }) => {
    if (!resource) return null;

    const resourceUrl = getResourceUrl(resource);

    if (resourceType === "image") {
      return (
        <div className="flex justify-start mt-4">
          <img
            src={resourceUrl || ""}
            alt="题目图片"
            className="w-[120px] h-[120px] object-cover rounded-lg shadow-md border border-border"
          />
        </div>
      );
    }

    if (resourceType === "audio") {
      return (
        <div className="flex justify-start mt-4">
          <AudioPlayer key={resource} src={resourceUrl || ""} />
        </div>
      );
    }

    return null;
  }
);

QuestionResource.displayName = "QuestionResource";

