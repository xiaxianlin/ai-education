import { useEffect } from 'react';
import { Card, Button } from 'antd';
import { ProDescriptions, ModalForm, ProFormText } from '@ant-design/pro-components';

import { useStudentInfo } from '../hooks/useStudentInfo';
import { StatusTag } from '@/components/ui';

type BasicInfoCardProps = {
  id: string;
  onStudentChange?: (student?: Student) => void;
  onEditReady?: (open: () => void) => void;
  onRefreshReady?: (refresh: () => void) => void;
};

export function BasicInfoCard({
  id,
  onStudentChange,
  onEditReady,
  onRefreshReady,
}: BasicInfoCardProps) {
  const {
    student,
    loading,
    refreshStudent,
    editForm,
    editFormVisible,
    setEditFormVisible,
    handleEditSubmit,
    editing,
    handleEdit,
  } = useStudentInfo(id);

  useEffect(() => {
    onStudentChange?.(student);
  }, [student, onStudentChange]);

  useEffect(() => {
    onEditReady?.(() => handleEdit());
  }, [handleEdit, onEditReady]);

  useEffect(() => {
    onRefreshReady?.(() => refreshStudent());
  }, [refreshStudent, onRefreshReady]);

  return (
    <>
      <Card
        title="基本信息"
        loading={loading}
        extra={
          <Button type="primary" onClick={handleEdit} disabled={!student}>
            编辑信息
          </Button>
        }
      >
        {student ? (
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="姓名">{student.name}</ProDescriptions.Item>
            <ProDescriptions.Item label="手机号">{student.phone}</ProDescriptions.Item>
            <ProDescriptions.Item label="状态">
              <StatusTag status={student.status === 1} />
            </ProDescriptions.Item>
            <ProDescriptions.Item label="创建时间" valueType="dateTime">
              {student.create_time * 1000}
            </ProDescriptions.Item>
            {student.update_time && (
              <ProDescriptions.Item label="更新时间" valueType="dateTime">
                {student.update_time * 1000}
              </ProDescriptions.Item>
            )}
          </ProDescriptions>
        ) : null}
      </Card>

      <ModalForm<StudentUpdateForm>
        width={500}
        form={editForm}
        open={editFormVisible}
        title="编辑学生"
        onFinish={async (values) => {
          await handleEditSubmit(values);
        }}
        loading={editing}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            setEditFormVisible(false);
            editForm.resetFields();
          },
        }}
        layout="horizontal"
        size="large"
        labelAlign="left"
        labelCol={{ span: 4 }}
      >
        <div className="pt-3" />
        <ProFormText
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
          fieldProps={{ maxLength: 50 }}
        />
        <ProFormText
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
          fieldProps={{ maxLength: 11 }}
        />
      </ModalForm>
    </>
  );
}
