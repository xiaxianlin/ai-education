import { useParams, history } from '@umijs/max';
import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import { TaskApi } from '@/services/task';
import { useRequest } from 'ahooks';
import { message, Button, Card, Space, Tag, Progress, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { fmtTime } from '@/utils/time';
import { useEffect } from 'react';

const statusConfig = {
  pending: { color: 'default', text: '待执行' },
  running: { color: 'processing', text: '执行中' },
  completed: { color: 'success', text: '已完成' },
  failed: { color: 'error', text: '失败' },
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: task, cancel } = useRequest(() => TaskApi.get(Number(id!)), {
    ready: !!id,
    refreshDeps: [id],
    pollingInterval: 3000,
    onError: () => {
      message.error('加载任务失败');
      history.back();
    },
  });

  useEffect(() => {
    if (task && (task.status === 'completed' || task.status === 'failed')) {
      // 任务完成或失败后停止轮询
      cancel();
    }
  }, [task]);

  if (!task) {
    return null;
  }

  // 解析参数和结果
  let paramsObj: any = {};
  let resultObj: any = {};
  try {
    paramsObj = JSON.parse(task.params || '{}');
  } catch (e) {
    console.error('解析任务参数失败:', e);
  }
  try {
    resultObj = JSON.parse(task.result || '{}');
  } catch (e) {
    console.error('解析任务结果失败:', e);
  }

  const config = statusConfig[task.status];

  return (
    <PageContainer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
            style={{ padding: 0, height: 'auto' }}
          />
          <span>任务详情</span>
        </div>
      }
      header={{
        breadcrumb: {},
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="基本信息">
          <ProDescriptions column={2}>
            <ProDescriptions.Item label="任务ID">{task.id}</ProDescriptions.Item>
            <ProDescriptions.Item label="状态">
              <Tag color={config.color}>{config.text}</Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item label="任务名称" span={2}>
              {task.task_name}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="任务类型">{task.task_type}</ProDescriptions.Item>
            <ProDescriptions.Item label="进度">
              {task.status === 'pending' && <Tag>0%</Tag>}
              {task.status === 'completed' && <Tag color="success">100%</Tag>}
              {task.status === 'failed' && <Tag color="error">失败</Tag>}
              {(task.status === 'running' || task.progress > 0) && (
                <Progress
                  percent={task.progress}
                  status={task.status === 'running' ? 'active' : 'normal'}
                  style={{ minWidth: 150 }}
                />
              )}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="处理器模块" span={2}>
              {task.handler_module}.{task.handler_function}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="创建时间" valueType="dateTime">
              {task.create_time * 1000}
            </ProDescriptions.Item>
            {task.start_time && (
              <ProDescriptions.Item label="开始时间" valueType="dateTime">
                {task.start_time * 1000}
              </ProDescriptions.Item>
            )}
            {task.end_time && (
              <ProDescriptions.Item label="结束时间" valueType="dateTime">
                {task.end_time * 1000}
              </ProDescriptions.Item>
            )}
            {task.update_time && (
              <ProDescriptions.Item label="更新时间" valueType="dateTime">
                {task.update_time * 1000}
              </ProDescriptions.Item>
            )}
          </ProDescriptions>
        </Card>

        {task.status === 'failed' && task.error_message && (
          <Card title="错误信息">
            <Alert message="任务执行失败" description={task.error_message} type="error" showIcon />
          </Card>
        )}

        <Card title="任务参数">
          <pre
            style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '400px',
            }}
          >
            {JSON.stringify(paramsObj, null, 2)}
          </pre>
        </Card>

        {task.status === 'completed' && Object.keys(resultObj).length > 0 && (
          <Card title="任务结果">
            <pre
              style={{
                padding: '12px',
                background: '#f0f9ff',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '400px',
              }}
            >
              {JSON.stringify(resultObj, null, 2)}
            </pre>
          </Card>
        )}

        {task.status === 'running' && (
          <Card>
            <Alert
              message="任务执行中"
              description="任务正在后台执行，页面会自动刷新以更新状态。"
              type="info"
              showIcon
            />
          </Card>
        )}
      </Space>
    </PageContainer>
  );
}
