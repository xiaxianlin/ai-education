/**
 * 练习记录详情页面
 * 显示单个练习会话的详细信息，包括题目、答案和报告
 */
import { PracticeResultModel } from "./models/page";
import { MainView } from "./views/Main";

export default function PracticeSessionData() {
  return (
    <PracticeResultModel.Provider>
      <MainView />
    </PracticeResultModel.Provider>
  );
}
