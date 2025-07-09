import { useBoolean } from 'ahooks';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
const useContainer = () => {
  const [robot, setRobot] = useState<Robot>();
  const [visible, { setTrue, setFalse }] = useBoolean(false);

  const showCallDrawer = (robot: Robot) => {
    setTrue();
    setRobot(robot);
  };

  const hideCallDrawer = () => {
    setFalse();
    setRobot(undefined);
  };

  return {
    robot,
    visible,
    showCallDrawer,
    hideCallDrawer,
  };
};

export const RobotCallModel = createContainer(useContainer);
export const useRobotCallModel = RobotCallModel.useContainer;
