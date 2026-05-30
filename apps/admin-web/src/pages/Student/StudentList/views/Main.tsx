import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">学生管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">维护学生账号、年级与教材配置。</p>
      </header>
      <TableView />
      <FormView />
    </main>
  );
}
