import { createContainer } from 'unstated-next';
const useContainer = () => {
  return {};
};

export const HomeModel = createContainer(useContainer);
export const useHomeModel = HomeModel.useContainer;
