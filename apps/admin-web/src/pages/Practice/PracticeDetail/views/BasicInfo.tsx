import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DescriptionList, type BadgeVariant } from '@/components/ui';
import { formatDateTime, GRADES } from '@ai-education/shared-web';
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
  const toBadgeVariant = (color?: string): BadgeVariant => {
    if (color === 'success' || color === 'green') return 'success';
    if (color === 'error' || color === 'red') return 'destructive';
    if (color === 'processing' || color === 'blue') return 'default';
    if (color === 'orange') return 'warning';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>基本信息</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList
          items={[
            { label: '练习ID', value: <span className="break-all">{session.id}</span> },
            {
              label: '练习类型',
              value: <Badge variant={toBadgeVariant(typeConfig?.color)}>{typeConfig?.label || session.practice_type}</Badge>,
            },
            { label: '状态', value: <Badge variant={toBadgeVariant(statusConfig?.color)}>{statusConfig?.label || '未知'}</Badge> },
            {
              label: '生成状态',
              value: <Badge variant={toBadgeVariant(generateConfig?.color)}>{generateConfig?.label || '未知'}</Badge>,
            },
            {
              label: '学生',
              value: session.student ? (
                <Button variant="link" onClick={() => navigate(`/student/detail/${session.student_id}`)}>
                  {session.student.name}
                </Button>
              ) : (
                session.student_id
              ),
            },
            { label: '科目', value: session.subject || '-' },
            { label: '年级', value: session.grade ? GRADES[session.grade] : '-' },
            { label: '能力代码', value: session.ability_code || '-' },
            { label: '单元ID', value: session.unit_id || '-' },
            { label: '开始时间', value: session.start_time ? formatDateTime(session.start_time) : '-' },
            { label: '结束时间', value: session.end_time ? formatDateTime(session.end_time) : '-' },
            { label: '创建时间', value: formatDateTime(session.create_time) },
          ]}
        />
      </CardContent>
    </Card>
  );
}
