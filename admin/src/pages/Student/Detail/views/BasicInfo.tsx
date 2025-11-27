import { Card, Button } from 'antd';
import { ProDescriptions } from '@ant-design/pro-components';
import { StatusTag } from '@/components/ui';
import { useStudentDetailModel } from '../models/page';

export function BasicInfo() {
  const { student, loading, editForm, setEditFormVisible } = useStudentDetailModel();

  const handleEdit = () => {
    if (student) {
      editForm.setFieldsValue({
        name: student.name,
        phone: student.phone,
      });
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
  );
}
