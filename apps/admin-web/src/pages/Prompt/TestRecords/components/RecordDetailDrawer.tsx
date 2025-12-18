import { Drawer, Descriptions, Tag, Typography, Space, Divider } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

const STATUS_CONFIG = {
  pending: { text: '待测试', color: 'default', icon: <ClockCircleOutlined /> },
  testing: { text: '测试中', color: 'processing', icon: <ClockCircleOutlined spin /> },
  success: { text: '成功', color: 'success', icon: <CheckCircleOutlined /> },
  failed: { text: '失败', color: 'error', icon: <CloseCircleOutlined /> },
};

interface RecordDetailDrawerProps {
  open: boolean;
  record?: PromptTestRecord;
  onClose: () => void;
}

export default function RecordDetailDrawer({ open, record, onClose }: RecordDetailDrawerProps) {
  if (!record) return null;

  const statusConfig = STATUS_CONFIG[record.status] || STATUS_CONFIG.pending;
  const usage = record.response_snapshot?.usage;

  return (
    <Drawer
      title={
        <Space>
          <CodeOutlined />
          <span>测试记录详情</span>
          <Tag icon={statusConfig.icon} color={statusConfig.color}>
            {statusConfig.text}
          </Tag>
        </Space>
      }
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      styles={{
        body: { padding: '24px', background: 'var(--muted)' },
      }}
    >
      {/* 基础信息卡片 */}
      <div style={{ background: 'var(--card)', borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="记录 ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="版本 ID">{record.version_id}</Descriptions.Item>
          <Descriptions.Item label="模型">
            <Text strong>
              {record.model_provider && <Text type="secondary">{record.model_provider} / </Text>}
              {record.model_name || '-'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="测试时间">
            {record.create_time ? dayjs.unix(record.create_time).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* 性能指标 */}
      <div style={{ background: 'var(--card)', borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <Text strong style={{ fontSize: 14, marginBottom: 16, display: 'block' }}>
          <ThunderboltOutlined style={{ marginRight: 8 }} />
          性能指标
        </Text>
        <Space size={48}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              响应耗时
            </Text>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--chart-1)' }}>
              {record.latency_ms !== undefined ? `${record.latency_ms}` : '-'}
              <Text type="secondary" style={{ fontSize: 14, marginLeft: 4 }}>
                ms
              </Text>
            </div>
          </div>
          {usage && (
            <>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  输入 Tokens
                </Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--chart-2)' }}>{usage.prompt_tokens ?? '-'}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  输出 Tokens
                </Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--chart-4)' }}>
                  {usage.completion_tokens ?? '-'}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  总计 Tokens
                </Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--chart-5)' }}>{usage.total_tokens ?? '-'}</div>
              </div>
            </>
          )}
        </Space>
      </div>

      {/* 输入参数 */}
      {record.input_payload && Object.keys(record.input_payload).length > 0 && (
        <div style={{ background: 'var(--card)', borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>
            输入参数
          </Text>
          <pre
            style={{
              background: 'var(--app-code-bg)',
              padding: 16,
              borderRadius: 6,
              margin: 0,
              fontSize: 13,
              lineHeight: 1.6,
              maxHeight: 120,
              overflow: 'auto',
              border: '1px solid var(--app-code-border)',
            }}
          >
            {JSON.stringify(record.input_payload, null, 2)}
          </pre>
        </div>
      )}

      {/* 渲染后的提示词 */}
      <div style={{ background: 'var(--card)', borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>
          渲染后的提示词
        </Text>
        <pre
          style={{
            background: 'var(--app-code-bg)',
            padding: 16,
            borderRadius: 6,
            margin: 0,
            fontSize: 13,
            lineHeight: 1.6,
            maxHeight: 200,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            border: '1px solid var(--app-code-border)',
          }}
        >
          {record.rendered_prompt || '-'}
        </pre>
      </div>

      {/* AI 响应内容 */}
      {record.response_snapshot?.content && (
        <div style={{ background: 'var(--card)', borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>
            AI 响应
          </Text>
          <div
            style={{
              background:
                'linear-gradient(135deg, var(--app-hero-gradient-from) 0%, var(--app-hero-gradient-to) 100%)',
              padding: 1,
              borderRadius: 6,
            }}
          >
            <pre
              style={{
                background: 'var(--card)',
                padding: 16,
                borderRadius: 5,
                margin: 0,
                fontSize: 13,
                lineHeight: 1.8,
                maxHeight: 300,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {record.response_snapshot.content}
            </pre>
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {record.error && (
        <div
          style={{
            background: 'var(--card)',
            borderRadius: 8,
            padding: 20,
            border: '1px solid var(--destructive)',
          }}
        >
          <Text strong type="danger" style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>
            <CloseCircleOutlined style={{ marginRight: 8 }} />
            错误信息
          </Text>
          <Paragraph
            type="danger"
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {record.error}
          </Paragraph>
        </div>
      )}
    </Drawer>
  );
}

