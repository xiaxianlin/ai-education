import { useConfigs } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { GRADES } from '@ai-education/shared-web';
import { useNavigate, useParams } from 'react-router-dom';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  const navigate = useNavigate();
  const { subjects } = useConfigs();
  const { subject, grade, setSubject, setGrade } = useInitialStateModel();
  useParams<{ id: string }>();

  const getTabClass = (active: boolean) => {
    const activeClass = 'bg-primary text-primary-foreground shadow-sm';
    const idleClass = 'text-muted-foreground hover:bg-background hover:text-foreground';
    return `inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors ${active ? activeClass : idleClass}`;
  };

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">学生教材配置管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">按学科和年级维护学生教材。</p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          onClick={() => navigate(-1)}
        >
          返回
        </button>
      </header>

      <section className="space-y-3">
        <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1">
          {subjects.map((item) => (
            <button key={item} type="button" className={getTabClass(item === subject)} onClick={() => setSubject(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1">
          {Object.keys(GRADES).map((item) => {
            const gradeValue = Number(item);
            return (
              <button
                key={item}
                type="button"
                className={getTabClass(gradeValue === grade)}
                onClick={() => setGrade(gradeValue)}
              >
                {GRADES[gradeValue]}
              </button>
            );
          })}
        </div>
      </section>

      <TableView />
      <FormView />
    </main>
  );
}
