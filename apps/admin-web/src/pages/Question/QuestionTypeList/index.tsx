import { AbilityPracticeModel } from './models/abilityPractice';
import { UnitPracticeModel } from './models/unitPractice';
import MainView from './views/Main';

export default function QuestionTypePage() {
  return (
    <UnitPracticeModel.Provider>
      <AbilityPracticeModel.Provider>
        <MainView />
      </AbilityPracticeModel.Provider>
    </UnitPracticeModel.Provider>
  );
}
