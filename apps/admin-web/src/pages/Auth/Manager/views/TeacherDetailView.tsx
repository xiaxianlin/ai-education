import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, DescriptionList, Modal, Spinner, type DataTableColumn } from '@/components/ui';
import { GRADES } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { AuthApi } from '../../api';

interface TeacherDetailViewProps {
  teacherId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatTime = (value?: number) => {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString();
};

const statusTextMap: Record<number, string> = {
  0: '停用',
  1: '启用',
};

const statusVariantMap: Record<number, 'success' | 'destructive'> = {
  0: 'destructive',
  1: 'success',
};

const formatGrade = (grade?: number) => {
  if (!grade) return '-';
  return GRADES[grade] || `${grade}年级`;
};

export function TeacherDetailView(props: TeacherDetailViewProps) {
  const { teacherId, open, onOpenChange } = props;

  const { data, loading } = useRequest(() => AuthApi.getTeacher(teacherId), {
    ready: open && !!teacherId,
    refreshDeps: [teacherId, open],
  });

  const studentColumns: DataTableColumn<TeacherDetailStudent>[] = [
    { key: 'name', title: '姓名', render: (student) => student.name || '-' },
    { key: 'phone', title: '手机号', render: (student) => student.phone || '-' },
    { key: 'grade', title: '年级', width: '100px', render: (student) => formatGrade(student.grade) },
    { key: 'subject', title: '学科', width: '100px', render: (student) => student.subject || '-' },
    { key: 'semester', title: '学期', width: '100px', render: (student) => student.semester || '-' },
  ];

  const textbookColumns: DataTableColumn<TeacherDetailTextbook>[] = [
    { key: 'subject', title: '学科', width: '100px', render: (textbook) => textbook.subject || '-' },
    { key: 'version', title: '版本', render: (textbook) => textbook.version || '-' },
    { key: 'grade', title: '年级', width: '100px', render: (textbook) => formatGrade(textbook.grade) },
    { key: 'semester', title: '学期', width: '120px', render: (textbook) => textbook.semester || '-' },
  ];

  const abilityColumns: DataTableColumn<TeacherDetailAbility>[] = [
    { key: 'code', title: '能力编码', render: (ability) => ability.code || '-' },
    { key: 'name', title: '能力名称', render: (ability) => ability.name || '-' },
    { key: 'subject', title: '学科', width: '100px', render: (ability) => ability.subject || '-' },
    { key: 'grade', title: '年级', width: '100px', render: (ability) => formatGrade(ability.grade) },
    { key: 'difficulty', title: '难度', width: '80px', render: (ability) => ability.difficulty || '-' },
  ];

  const questionColumns: DataTableColumn<TeacherDetailQuestion>[] = [
    { key: 'question_type_code', title: '题型编码', render: (question) => question.question_type_code || '-' },
    { key: 'subject', title: '学科', width: '100px', render: (question) => question.subject || '-' },
    { key: 'grade', title: '年级', width: '100px', render: (question) => formatGrade(question.grade) },
    { key: 'difficulty', title: '难度', render: (question) => question.difficulty || '-' },
    { key: 'create_time', title: '创建时间', width: '180px', render: (question) => formatTime(question.create_time) },
  ];

  return (
    <Modal title="教师详情" open={open} onClose={() => onOpenChange(false)}>
      {loading ? (
        <Spinner />
      ) : data ? (
        <div className="max-h-[72vh] space-y-4 overflow-y-auto pr-1">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionList
                items={[
                  { label: '教师账号', value: data.teacher.account || '-' },
                  { label: '姓名', value: data.teacher.name || '-' },
                  { label: '手机号', value: data.teacher.phone || '-' },
                  { label: '学科', value: data.teacher.subject ? <Badge variant="outline">{data.teacher.subject}</Badge> : '-' },
                  { label: '学校', value: data.teacher.school || '-' },
                  {
                    label: '状态',
                    value: <Badge variant={statusVariantMap[data.teacher.status] || 'destructive'}>{statusTextMap[data.teacher.status] || '未知'}</Badge>,
                  },
                  { label: '关联学生', value: data.stats?.student_count ?? 0 },
                  { label: '教材数', value: data.stats?.textbook_count ?? 0 },
                  { label: '能力数', value: data.stats?.ability_count ?? 0 },
                  { label: '题目数', value: data.stats?.question_count ?? 0 },
                  { label: '创建时间', value: formatTime(data.teacher.create_time) },
                  { label: '更新时间', value: formatTime(data.teacher.update_time) },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>学生信息</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={studentColumns} data={data.students || []} rowKey="id" emptyText="暂无学生信息" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>教材信息</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={textbookColumns} data={data.textbooks || []} rowKey="id" emptyText="暂无教材信息" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>能力信息</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={abilityColumns} data={data.abilities || []} rowKey="id" emptyText="暂无能力信息" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>题目信息</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={questionColumns} data={data.questions || []} rowKey="id" emptyText="暂无题目信息" />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </Modal>
  );
}
