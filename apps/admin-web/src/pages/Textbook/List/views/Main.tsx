import { ModalForm, PageContainer, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { useTextbookListModel } from '../models/page';
import { Button, Space, Tag } from 'antd';
import { adminApi } from '@ai-education/shared-student';
import { useMemo } from 'react';
import { GRADES } from '@/constants/course';
import { Link } from '@umijs/max';
import { useConfigs } from '@/hooks';
import { CommonTable } from '@/components/business';

export default function MainView() {
  const { semesters, textbook_versions, subjectEnum, gradeEnum, textbookVersionEmun } =
    useConfigs();
  const { actionRef, instance, edited, visible, showForm, onCancel, handleSubmit } =
    useTextbookListModel();

  const columns = useMemo<ProColumns<Textbook>[]>(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        valueType: 'digit',
        hideInSearch: true,
      },
      {
        title: '版本',
        dataIndex: 'version',
        valueType: 'select',
        valueEnum: textbookVersionEmun,
      },
      {
        title: '科目',
        dataIndex: 'subject',
        valueType: 'select',
        valueEnum: subjectEnum,
        render: (_, record) => {
          const subject = record.subject;
          const subjectColorMap: Record<string, string> = {
            数学: 'blue',
            英语: 'orange',
          };
          const color = subjectColorMap[subject] || 'default';
          return <Tag color={color}>{subject}</Tag>;
        },
      },
      {
        title: '年级',
        dataIndex: 'grade',
        valueType: 'select',
        valueEnum: gradeEnum,
        hideInTable: false,
        render: (_, record) => `${GRADES[record.grade]}${record.semester}`,
      },
      {
        title: '文件上传',
        dataIndex: 'name',
        hideInSearch: true,
        render: (_, record) =>
          record.file ? <Tag color="success">已上传</Tag> : <Tag>未上传</Tag>,
      },
      {
        title: '单元解析',
        dataIndex: 'is_parsed',
        hideInSearch: true,
        render: (is_parsed) => (is_parsed ? <Tag color="success">已解析</Tag> : <Tag>未解析</Tag>),
      },
      {
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        width: 120,
        render: (_, record) => (
          <Space>
            <Link key="detail" to={`/textbook/detail/${record.id}`}>
              <Button size="small" type="link">
                详情
              </Button>
            </Link>
            <Button size="small" key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
          </Space>
        ),
      },
    ],
    [showForm, subjectEnum, textbookVersionEmun, gradeEnum],
  );

  return (
    <PageContainer title="教材管理" header={{ breadcrumb: {} }}>
      <CommonTable<Textbook>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          layout: 'inline',
          defaultColsNumber: 3,
          defaultCollapsed: false,
        }}
        headerTitle={
          <Button type="primary" onClick={() => showForm()}>
            新增教材
          </Button>
        }
        request={async ({ pageSize, current, ...filter }) => {
          const data = await adminApi.searchTextbooks({
            page: current || 1,
            size: pageSize || 10,
            ...filter,
          });
          return {
            data: data.data || [],
            success: true,
            total: data.total,
          };
        }}
      />
      <ModalForm<TextbookForm>
        width={600}
        form={instance}
        open={visible}
        title={edited ? '更新教材' : '新增教材'}
        onFinish={handleSubmit}
        modalProps={{ destroyOnHidden: true, onCancel }}
        layout="horizontal"
        size="large"
        labelAlign="left"
        labelCol={{ span: 3 }}
      >
        <div className="pt-3" />
        <ProFormSelect
          name="subject"
          label="科目"
          placeholder="请选择科目"
          rules={[{ required: true }]}
          valueEnum={subjectEnum}
        />
        <ProFormSelect
          name="version"
          label="版本"
          placeholder="请选择版本"
          rules={[{ required: true }]}
          valueEnum={textbook_versions?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
        />
        <ProFormSelect
          name="grade"
          label="年级"
          placeholder="请选择年级"
          rules={[{ required: true }]}
          valueEnum={gradeEnum}
        />
        <ProFormSelect
          name="semester"
          label="学期"
          placeholder="请选择学期"
          rules={[{ required: true }]}
          valueEnum={semesters?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
        />
      </ModalForm>
    </PageContainer>
  );
}
