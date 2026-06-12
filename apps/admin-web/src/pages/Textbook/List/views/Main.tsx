import { Button, Card, CardContent, Field, Input, PageShell, Select } from '@/components/ui';
import { isAdminManager } from '@/constants/manager';
import { useConfigs } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { AuthApi } from '@/pages/Auth/api';
import { GRADES } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { Plus, RotateCcw } from 'lucide-react';
import { useTextbookListModel } from '../models/page';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  const { semesters, subjects } = useConfigs();
  const { manager } = useInitialStateModel();
  const {
    subject,
    grade,
    teacherId,
    version,
    semester,
    setSubject,
    setGrade,
    setTeacherId,
    setVersion,
    setSemester,
    formProps: { showForm },
  } = useTextbookListModel();
  const showTeacherFilter = isAdminManager(manager?.type);
  const gradeOptions = Object.keys(GRADES).map((key) => Number(key));
  const { data: teacherResult } = useRequest(() => AuthApi.searchTeachers({ size: 100, status: 1 }), {
    ready: showTeacherFilter,
  });
  const filterGridClass = showTeacherFilter
    ? 'grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-5'
    : 'grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4';

  const resetFilter = () => {
    setTeacherId('');
    setSubject('');
    setGrade(undefined);
    setVersion('');
    setSemester('');
  };

  return (
    <PageShell title="教材管理" description="按学科和年级维护教材基础资料。">
      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className={filterGridClass}>
            {showTeacherFilter ? (
              <Field label="老师">
                <Select value={teacherId} onChange={(event) => setTeacherId(event.target.value)}>
                  <option value="">全部老师</option>
                  {(teacherResult?.data || []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.account}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
            <Field label="学科">
              <Select value={subject || ''} onChange={(event) => setSubject(event.target.value)}>
                <option value="">全部学科</option>
                {subjects.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="年级">
              <Select value={grade ?? ''} onChange={(event) => setGrade(event.target.value ? Number(event.target.value) : undefined)}>
                <option value="">全部年级</option>
                {gradeOptions.map((item) => (
                  <option key={item} value={item}>
                    {GRADES[item]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="教材版本">
              <Input value={version} placeholder="按版本筛选" onChange={(event) => setVersion(event.target.value)} />
            </Field>
            <Field label="学期">
              <Select value={semester} onChange={(event) => setSemester(event.target.value)}>
                <option value="">全部学期</option>
                {semesters.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:justify-end">
            <Button variant="outline" icon={<RotateCcw className="size-4" />} onClick={resetFilter}>
              重置
            </Button>
            <Button icon={<Plus className="size-4" />} onClick={() => showForm()}>
              新增教材
            </Button>
          </div>
        </CardContent>
      </Card>
      <TableView />
      <FormView />
    </PageShell>
  );
}
