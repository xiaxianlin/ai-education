import { formatDateTime, GRADES } from '@ai-education/shared-web';
import { ProDescriptions } from '@ant-design/pro-components';
import { Button, Card, Tag } from 'antd';
import {
  GENERATE_STATUS_CONFIG,
  PRACTICE_STATUS_CONFIG,
  PRACTICE_TYPE_CONFIG,
} from '../../PracticeList/utils';
import { usePracticeDetailModel } from '../models/page';

export function BasicInfo() {
  const { session, navigate } = usePracticeDetailModel();

  if (!session) {
    return null;
  }

  const statusConfig = PRACTICE_STATUS_CONFIG[session.status as PracticeStatus];
  const typeConfig = PRACTICE_TYPE_CONFIG[session.practice_type];
  const generateConfig = GENERATE_STATUS_CONFIG[session.generate_status as PracticeGenerateStatus];

  return (
    <Card title="基本信息">
      <ProDescriptions column={3}>
        <ProDescriptions.Item label="练习ID" copyable>
          {session.id}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="练习类型">
          <Tag color={typeConfig?.color || 'default'}>{typeConfig?.label || session.practice_type}</Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label="状态">
          <Tag color={statusConfig?.color || 'default'}>{statusConfig?.label || '未知'}</Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label="生成状态">
          <Tag color={generateConfig?.color || 'default'}>{generateConfig?.label || '未知'}</Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label="学生">
          {session.student ? (
            <Button type="link" size="small" onClick={() => navigate(`/student/detail/${session.student_id}`)}>
              {session.student.name}
            </Button>
          ) : (
            session.student_id
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="科目">{session.subject || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="年级">{session.grade ? GRADES[session.grade] : '-'}</ProDescriptions.Item>
        {session.ability_code && (
          <ProDescriptions.Item label="能力代码">{session.ability_code}</ProDescriptions.Item>
        )}
        {session.unit_id && <ProDescriptions.Item label="单元ID">{session.unit_id}</ProDescriptions.Item>}
        <ProDescriptions.Item label="开始时间">
          {session.start_time ? formatDateTime(session.start_time) : '-'}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="结束时间">
          {session.end_time ? formatDateTime(session.end_time) : '-'}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="创建时间">{formatDateTime(session.create_time)}</ProDescriptions.Item>
      </ProDescriptions>
    </Card>
  );
}
