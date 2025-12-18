import { Card, Button } from 'antd';
import { ProDescriptions } from '@ant-design/pro-components';
import { StatusTag } from '@/components';
import { useStudentDetailModel } from '../models/page';
import { GRADES } from '@/constants/course';

export function BasicInfo() {
  const { student, loading, editForm, setEditFormVisible } = useStudentDetailModel();

  const handleEdit = () => {
    if (student) {
      editForm.setFieldsValue({ ...student });
      setEditFormVisible(true);
    }
  };

  return (
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
          <ProDescriptions.Item label="姓名">{(student as any)?.name || ''}</ProDescriptions.Item>
          <ProDescriptions.Item label="手机号">{(student as any)?.phone || ''}</ProDescriptions.Item>
          <ProDescriptions.Item label="年级">{(student as any)?.grade !== undefined ? GRADES[(student as any).grade] : ''}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">
            <StatusTag status={(student as any)?.status === 1} />
          </ProDescriptions.Item>
          <ProDescriptions.Item label="创建时间" valueType="dateTime">
            {(student as any)?.create_time ? (student as any).create_time * 1000 : ''}
          </ProDescriptions.Item>
          {(student as any)?.update_time && (
            <ProDescriptions.Item label="更新时间" valueType="dateTime">
              {(student as any).update_time * 1000}
            </ProDescriptions.Item>
          )}
        </ProDescriptions>
      ) : null}
    </Card>
  );
}
