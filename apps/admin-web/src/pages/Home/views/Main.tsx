import { QuestionApi } from '@/pages/Question/api';
import { StudentApi } from '@/pages/Student/api';
import { TextbookApi } from '@/pages/Textbook/api';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const iconToneMap: Record<string, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
};

export default function MainView() {
  const navigate = useNavigate();

  const { data: studentData, loading: studentLoading } = useRequest(async () => {
    return await StudentApi.searchStudents({ page: 1, size: 1000 });
  });

  const { data: textbookData, loading: textbookLoading } = useRequest(async () => {
    return await TextbookApi.searchTextbooks();
  });

  const { data: questionData, loading: questionLoading } = useRequest(async () => {
    return await QuestionApi.searchQuestions({ page: 1, size: 1000 });
  });

  const totalStudents = studentData?.data?.length || 0;
  const activeStudents = studentData?.data?.filter((student: any) => student.status === 1).length || 0;
  const totalTextbooks = textbookData?.total || 0;
  const totalQuestions = questionData?.total || 0;
  const loading = studentLoading || textbookLoading || questionLoading;

  const statisticItems = [
    { title: '学生总数', value: totalStudents, icon: 'S', tone: 'blue' },
    { title: '活跃学生', value: activeStudents, icon: 'A', tone: 'emerald' },
    { title: '教材总数', value: totalTextbooks, icon: 'T', tone: 'sky' },
    { title: '题目总数', value: totalQuestions, icon: 'Q', tone: 'amber' },
  ];

  const quickActions = [
    { title: '学生管理', description: '维护学生账号与资料', path: '/student' },
    { title: '教材管理', description: '查看教材和单元结构', path: '/textbook' },
    { title: '题目管理', description: '检索和维护题库内容', path: '/question' },
    { title: '练习管理', description: '查看练习生成与完成情况', path: '/practice' },
  ];

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">工作台</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看后台关键数据，并快速进入常用管理模块。</p>
        </div>
        <span className="inline-flex w-fit rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
          {dayjs().format('YYYY-MM-DD HH:mm')}
        </span>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statisticItems.map((item) => (
          <div key={item.title} className="rounded-lg border bg-background p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{item.title}</div>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-semibold ${iconToneMap[item.tone]}`}
              >
                {item.icon}
              </span>
            </div>
            <div className="mt-5 text-3xl font-semibold tracking-normal text-foreground">
              {loading ? '-' : item.value}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border bg-background shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-base font-semibold text-foreground">快捷入口</h2>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {quickActions.map((item) => (
              <button
                key={item.path}
                type="button"
                className="rounded-lg border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/50"
                onClick={() => navigate(item.path)}
              >
                <div className="text-sm font-medium text-foreground">{item.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-background shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-base font-semibold text-foreground">系统概览</h2>
          </div>
          <dl className="divide-y px-5">
            <div className="flex items-center justify-between py-4">
              <dt className="text-sm text-muted-foreground">后台服务</dt>
              <dd className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                运行中
              </dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="text-sm text-muted-foreground">当前日期</dt>
              <dd className="text-sm text-foreground">{dayjs().format('YYYY-MM-DD')}</dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="text-sm text-muted-foreground">数据范围</dt>
              <dd className="text-sm text-foreground">本地数据库</dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="text-sm text-muted-foreground">常用操作</dt>
              <dd className="flex gap-2">
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
                  onClick={() => navigate('/ability')}
                >
                  能力
                </button>
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
                  onClick={() => navigate('/practice')}
                >
                  练习
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
