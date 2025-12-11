import { createContainer } from "unstated-next";
import { useProfileModel } from "@/models/ProfileModel";

const useContainer = () => {
  const { activeTextbooksMap } = useProfileModel();

  return { textbooks: activeTextbooksMap };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
