import { DeleteButton } from '@/components';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type DataTableColumn,
} from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import { Link } from 'react-router-dom';
import { QuestionApi } from '../../api';
import { useQuestionTypeModel } from '../models/page';

export default function UnitPracticeListView() {
  const { unitRefreshKey, showForm, handleDelete } = useQuestionTypeModel();

  const { data = [], loading } = useRequest(() => QuestionApi.searchUnitPracticeTypes(), {
    refreshDeps: [unitRefreshKey],
    onError: (error: any) => toast.error(error?.message || '单元练习题型加载失败'),
  });

  const columns: DataTableColumn<QuestionType>[] = [
    { key: 'name', title: '名称', width: '160px' },
    { key: 'code', title: '编码', width: '180px' },
    {
      key: 'description',
      title: '描述',
      render: (record) => <div className="max-w-[520px] truncate">{record.description || '-'}</div>,
    },
    {
      key: 'actions',
      title: '操作',
      width: '240px',
      className: 'text-right',
      render: (record) => (
        <div className="flex justify-end gap-2">
          <Button variant="link" onClick={() => showForm(record)}>
            编辑
          </Button>
          <Link to={`/question_type/settings/prompt/${record.code}`}>
            <Button variant="link">提示词</Button>
          </Link>
          <Link to={`/question/generate/${record.code}`}>
            <Button variant="link">生成</Button>
          </Link>
          <DeleteButton onConfirm={() => handleDelete(record.id)} buttonProps={{ size: 'sm' }} />
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>单元练习题型</CardTitle>
        <Button onClick={() => showForm()}>新增题型</Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} rowKey="id" loading={loading} />
      </CardContent>
    </Card>
  );
}
