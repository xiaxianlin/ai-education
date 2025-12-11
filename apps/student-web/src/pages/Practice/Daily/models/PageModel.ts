import { createContainer } from "unstated-next";
import { useProfileModel } from "@/models/ProfileModel";
import { useMemo } from "react";

const useContainer = () => {
  const { activeTextbooks } = useProfileModel();

  const textbooks = useMemo(() => {
    return activeTextbooks.reduce(
      (acc, textbook) => {
        acc[textbook.subject] = textbook;
        return acc;
      },
      {} as Record<string, Textbook>,
    );
  }, [activeTextbooks]);

  return { textbooks };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
