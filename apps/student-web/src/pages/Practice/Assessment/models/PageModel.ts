import { createContainer } from "unstated-next";
import { useProfileModel } from "@/models/ProfileModel";

const useContainer = () => {
  const { activeTextbooks } = useProfileModel();

  return { textbooks: activeTextbooks };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
