import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, Select } from '@/components/ui';
import { GRADES } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GENERATE_STATUS_CONFIG,
  PRACTICE_STATUS_CONFIG,
  PRACTICE_TYPE_CONFIG,
} from '../../../Practice/PracticeList/utils';
import { StudentApi } from '../../api';
import { useStudentDetailModel } from '../models/page';

const badgeVariantMap: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  default: 'secondary',
  processing: 'default',
  success: 'success',
  error: 'destructive',
  blue: 'default',
  green: 'success',
};

const formatTime = (value?: number) => {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString();
};

export function PracticeList() {
  const navigate = useNavigate();
  const { student } = useStudentDetailModel();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, loading } = useRequest(
    () =>
      StudentApi.getStudentPracticeSessions(student?.id || '', {
        page,
        page_size: pageSize,
      }),
    {
      ready: !!student?.id,
      refreshDeps: [student?.id, page, pageSize],
    },
  );

  const practices = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Card>
      <CardHeader>
        <CardTitle>练习记录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataTable<Practice>
          rowKey="id"
          loading={loading}
          emptyText="暂无练习记录"
          data={practices}
          columns={[
            {
              key: 'practice_type',
              title: '练习类型',
              render: (record) => {
                const config = PRACTICE_TYPE_CONFIG[record.practice_type] || {
                  label: record.practice_type,
                  color: 'default',
                };
                return <Badge variant={badgeVariantMap[config.color] || 'secondary'}>{config.label}</Badge>;
              },
            },
            { key: 'subject', title: '科目', width: '90px', render: (record) => record.subject || '-' },
            { key: 'grade', title: '年级', width: '100px', render: (record) => (record.grade ? GRADES[record.grade] : '-') },
            {
              key: 'content',
              title: '练习内容',
              render: (record) => {
                if (record.practice_type === 'ability_practice') {
                  return record.ability_name || record.ability_code || '-';
                }
                if (record.practice_type === 'unit_practice') {
                  return record.unit_name || record.unit_id || '-';
                }
                return '-';
              },
            },
            { key: 'question_count', title: '总题数', width: '90px', render: (record) => `${record.question_count} 题` },
            { key: 'answer_count', title: '已答题数', width: '100px', render: (record) => `${record.answer_count} 题` },
            { key: 'correct_count', title: '正确题数', width: '100px', render: (record) => `${record.correct_count} 题` },
            {
              key: 'rate',
              title: '正确率',
              width: '90px',
              render: (record) => {
                if (record.answer_count === 0) return '-';
                return `${((record.correct_count / record.answer_count) * 100).toFixed(1)}%`;
              },
            },
            {
              key: 'status',
              title: '状态',
              width: '100px',
              render: (record) => {
                const config = PRACTICE_STATUS_CONFIG[record.status as PracticeStatus] || {
                  label: '未知',
                  color: 'default',
                };
                return <Badge variant={badgeVariantMap[config.color] || 'secondary'}>{config.label}</Badge>;
              },
            },
            {
              key: 'generate_status',
              title: '生成状态',
              width: '100px',
              render: (record) => {
                const config = GENERATE_STATUS_CONFIG[record.generate_status as PracticeGenerateStatus] || {
                  label: '未知',
                  color: 'default',
                };
                return <Badge variant={badgeVariantMap[config.color] || 'secondary'}>{config.label}</Badge>;
              },
            },
            { key: 'create_time', title: '创建时间', width: '170px', render: (record) => formatTime(record.create_time) },
            {
              key: 'actions',
              title: '操作',
              width: '90px',
              render: (record) => (
                <Button variant="link" size="xs" onClick={() => navigate(`/practice/detail/${record.id}`)}>
                  详情
                </Button>
              ),
            },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            共 {total} 条，第 {page} / {totalPages} 页
          </div>
          <div className="flex items-center gap-2">
            <Select
              className="w-28"
              value={pageSize}
              onChange={(event) => {
                setPage(1);
                setPageSize(Number(event.target.value));
              }}
            >
              <option value={20}>20 条/页</option>
              <option value={50}>50 条/页</option>
            </Select>
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              上一页
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
