import {
  Button,
  Card,
  CardContent,
  CardTitle,
  DataTable,
  Field,
  Input,
  Modal,
  Textarea,
  type DataTableColumn,
} from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { TextbookApi } from '../../api';
import { useTextbookDetailModel } from '../models/page';
import { useTextbookUnitModel } from '../models/unit';

export const UnitView = () => {
  const { id, setUnits } = useTextbookDetailModel();
  const {
    actionRef,
    formProps: { visible, item, loading: submitting, showForm, onCancel, handleSubmit },
    handleDelete,
  } = useTextbookUnitModel();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const {
    data = [],
    loading,
    refresh,
  } = useRequest(
    async () => {
      const rows = await TextbookApi.getTextbookUnits(id);
      setUnits(rows);
      return rows;
    },
    { refreshDeps: [id] },
  );

  useEffect(() => {
    actionRef.current = { reload: refresh };
  }, [actionRef, refresh]);

  useEffect(() => {
    if (!visible) return;
    setName(item?.name || '');
    setContent(item?.content || '');
  }, [item, visible]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !content) {
      toast.error('请填写单元名称和内容');
      return;
    }
    handleSubmit({ name, content, textbook_id: id });
  };

  const columns: DataTableColumn<Unit>[] = [
    {
      key: 'index',
      title: '单元序号',
      width: '96px',
      render: (_record, index) => index + 1,
    },
    { key: 'name', title: '单元名称', width: '220px' },
    {
      key: 'content',
      title: '单元内容',
      render: (record) => (
        <span className="block max-w-xl truncate" title={record.content}>
          {record.content}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (record) => (
        <div className="flex justify-start gap-2">
          <Button variant="outline" size="xs" icon={<Edit3 className="size-4" />} onClick={() => showForm(record)}>
            编辑
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="text-destructive"
            icon={<Trash2 className="size-4" />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle>教材单元</CardTitle>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => showForm()}>
          添加单元
        </Button>
      </div>
      <CardContent>
        <DataTable columns={columns} data={data} loading={loading} rowKey="id" />
      </CardContent>
      <Modal
        open={visible}
        title={item ? '更新单元' : '新增单元'}
        onClose={onCancel}
        footer={
          <>
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button loading={submitting} type="submit" form="unit-form">
              保存
            </Button>
          </>
        }
      >
        <form id="unit-form" className="grid gap-4" onSubmit={onSubmit}>
          <Field label="单元名称" required>
            <Input
              maxLength={100}
              placeholder="请输入单元名称"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="单元内容" required>
            <Textarea
              className="min-h-40"
              maxLength={2000}
              placeholder="请输入单元内容"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </Field>
        </form>
      </Modal>
    </Card>
  );
};
