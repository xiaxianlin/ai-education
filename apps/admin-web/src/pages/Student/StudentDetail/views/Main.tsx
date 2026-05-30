import { useNavigate } from 'react-router-dom';
import { useStudentDetailModel } from '../models/page';
import { AbilityMastery } from './AbilityMastery';
import { BasicInfo } from './BasicInfo';
import { PracticeList } from './PracticeList';

export function Main() {
  const navigate = useNavigate();
  const { loading } = useStudentDetailModel();

  if (loading) {
    return (
      <main className="space-y-4 p-6">
        <div className="h-8 w-40 rounded-md bg-muted" />
        <div className="h-48 rounded-lg border bg-muted/40" />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">学生详情</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看学生资料、能力掌握度和练习记录。</p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          onClick={() => navigate(-1)}
        >
          返回
        </button>
      </header>
      <div className="space-y-4">
        <BasicInfo />
        <AbilityMastery />
        <PracticeList />
      </div>
    </main>
  );
}
