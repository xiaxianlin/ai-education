import { DeleteButton } from '@/components';
import {
  Badge,
  Button,
  Card,
  CardContent,
  DataTable,
  PageShell,
  classNames,
  type BadgeVariant,
  type DataTableColumn,
} from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { formatDateTime, GRADES } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { Link } from 'react-router-dom';
import { PracticeApi } from '../../api';
import { usePracticeListModel } from '../models/page';
import { GENERATE_STATUS_CONFIG, PRACTICE_STATUS_CONFIG, PRACTICE_TYPE_CONFIG } from '../utils';

export default function MainView() {
  const { navigate, practiceType, refreshKey, practiceTypes, handleTabChange, handleDelete } = usePracticeListModel();
  const { data, loading } = useRequest(
    () => {
      const requestParams: SearchPracticeRequest = {
        page: 1,
        size: 50,
      };
      if (practiceType !== 'all') {
        requestParams.practice_type = practiceType;
      }
      return PracticeApi.searchPractices(requestParams);
    },
    {
      refreshDeps: [practiceType, refreshKey],
      onError: (error: any) => toast.error(error?.message || '练习列表加载失败'),
    },
  );

  const rows = data?.data || [];
  const toBadgeVariant = (color?: string): BadgeVariant => {
    if (color === 'success' || color === 'green') return 'success';
    if (color === 'error' || color === 'red') return 'destructive';
    if (color === 'processing' || color === 'blue') return 'default';
    if (color === 'orange') return 'warning';
    return 'secondary';
  };

  const getPracticeContent = (record: Practice) => {
    if (record.practice_type === 'ability_practice') {
      return record.ability_name || record.ability_code || '-';
    }
    if (record.practice_type === 'unit_practice') {
      return record.unit_name || record.unit_id || '-';
    }
    return '-';
  };

  const getCorrectRate = (record: Practice) => {
    if (record.answer_count === 0) return '-';
    return `${((record.correct_count / record.answer_count) * 100).toFixed(1)}%`;
  };

  const columns: DataTableColumn<Practice>[] = [
    {
      key: 'student',
      title: '学生',
      width: '120px',
      render: (record) =>
        record.student ? (
          <Link className="font-medium text-foreground underline-offset-4 hover:underline" to={`/student/detail/${record.student_id}`}>
            {record.student.name}
          </Link>
        ) : (
          record.student_id
        ),
    },
    { key: 'subject', title: '科目', width: '80px', render: (record) => record.subject || '-' },
    { key: 'grade', title: '年级', width: '100px', render: (record) => (record.grade ? GRADES[record.grade] : '-') },
    {
      key: 'content',
      title: '练习内容',
      render: (record) => <div className="max-w-[220px] truncate">{getPracticeContent(record)}</div>,
    },
    {
      key: 'practice_type',
      title: '练习类型',
      width: '120px',
      render: (record) => {
        const config = PRACTICE_TYPE_CONFIG[record.practice_type] || {
          label: record.practice_type,
          color: 'default',
        };
        return <Badge variant={toBadgeVariant(config.color)}>{config.label}</Badge>;
      },
    },
    {
      key: 'progress',
      title: '进度',
      width: '100px',
      render: (record) => `${record.answer_count}/${record.question_count} 题`,
    },
    { key: 'rate', title: '正确率', width: '90px', render: (record) => getCorrectRate(record) },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      render: (record) => {
        const config = PRACTICE_STATUS_CONFIG[record.status as PracticeStatus] || {
          label: '未知',
          color: 'default',
        };
        return <Badge variant={toBadgeVariant(config.color)}>{config.label}</Badge>;
      },
    },
    {
      key: 'generate_status',
      title: '生成状态',
      width: '110px',
      render: (record) => {
        const config = GENERATE_STATUS_CONFIG[record.generate_status as PracticeGenerateStatus] || {
          label: '未知',
          color: 'default',
        };
        return <Badge variant={toBadgeVariant(config.color)}>{config.label}</Badge>;
      },
    },
    { key: 'create_time', title: '创建时间', width: '170px', render: (record) => formatDateTime(record.create_time) },
    {
      key: 'actions',
      title: '操作',
      width: '120px',
      className: 'text-right',
      render: (record) => (
        <div className="flex justify-end gap-2">
          <Button variant="link" onClick={() => navigate(`/practice/detail/${record.id}`)}>
            详情
          </Button>
          <DeleteButton
            title="确定要删除这次练习吗？"
            description="删除后练习数据及报告将无法恢复。"
            onConfirm={() => handleDelete(record.id)}
            buttonProps={{ size: 'sm' }}
          />
        </div>
      ),
    },
  ];

  return (
    <PageShell title="练习管理" description="查看学生练习会话、完成进度和生成状态。">
      <Card>
        <CardContent>
          <div className="mb-4 inline-flex rounded-lg bg-muted p-1">
            {practiceTypes.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                className={classNames(practiceType === item.key && 'bg-background text-foreground shadow-sm')}
                onClick={() => handleTabChange(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <DataTable columns={columns} data={rows} rowKey="id" loading={loading} />
          <div className="mt-4 text-sm text-muted-foreground">共 {data?.total || 0} 条</div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
