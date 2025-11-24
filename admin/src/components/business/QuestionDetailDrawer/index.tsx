import { Drawer, Tag, Image } from 'antd';
import { AudioPlayer } from '@/components/ui';

// OSS 基础 URL
const OSS_BASE_URL = 'https://xxl-ai-helper.oss-cn-hangzhou.aliyuncs.com';

interface QuestionDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  question?: {
    id: number;
    content: string;
    type?: string;
    subtype?: string;
    options?: string;
    answer?: string;
    difficulty?: string;
    knowledge?: string;
    resource?: string;
    resource_type?: 'image' | 'audio' | 'video' | null;
    resource_content?: string;
  } | null;
  studentAnswer?: {
    answer?: string;
    status?: number; // 答题状态: 0-未答, 1-正确, 2-错误
    time_spent?: number;
    submit_time?: number;
    audio_data?: string;
  } | null;
}

/**
 * 构建资源 URL
 */
function buildResourceUrl(resource?: string): string | null {
  if (!resource) return null;
  
  // 如果已经是完整 URL，直接返回
  if (resource.startsWith('http://') || resource.startsWith('https://')) {
    return resource;
  }
  
  // 否则拼接 OSS 基础 URL
  return `${OSS_BASE_URL}/${resource}`;
}

/**
 * 解析选项
 */
function parseOptions(options?: string): string[] {
  if (!options) return [];
  
  try {
    const parsed = JSON.parse(options);
    if (Array.isArray(parsed)) {
      return parsed.map((opt: any) => 
        typeof opt === 'string' ? opt : opt.text || opt.label || JSON.stringify(opt)
      );
    }
  } catch {
    // 解析失败，尝试按换行符分割
  }
  
  // 按换行符分割
  return options.split('\n').filter((line) => line.trim());
}

export function QuestionDetailDrawer({
  open,
  onClose,
  question,
  studentAnswer,
}: QuestionDetailDrawerProps) {
  if (!question) return null;

  const resourceUrl = buildResourceUrl(question.resource);
  const optionsList = parseOptions(question.options);
  const hasStudentAnswer = studentAnswer && 
    studentAnswer.status !== undefined && 
    studentAnswer.status !== null && 
    studentAnswer.status !== 0;

  return (
    <Drawer
      title="题目详情"
      placement="right"
      width={600}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <div style={{ padding: '8px 0' }}>
        {/* 题目ID */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>
            题目ID
          </div>
          <div style={{ fontSize: '16px' }}>{question.id}</div>
        </div>

        {/* 题目内容 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>
            题目内容
          </div>
          <div
            style={{
              padding: '12px',
              background: '#fafafa',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
            }}
          >
            {question.content}
          </div>
        </div>

        {/* 选项 */}
        {optionsList.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>
              选项
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
              }}
            >
              {optionsList.map((option, index) => {
                const optionLabel = String.fromCharCode(65 + index); // A, B, C, D...
                return (
                  <Tag key={index} style={{ margin: 0 }}>
                    {optionLabel}. {option}
                  </Tag>
                );
              })}
            </div>
          </div>
        )}

        {/* 正确答案 */}
        {question.answer && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>
              正确答案
            </div>
            <Tag color="success" style={{ fontSize: '14px', padding: '4px 12px' }}>
              {question.answer}
            </Tag>
          </div>
        )}

        {/* 学生答案 */}
        {hasStudentAnswer && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>
              学生答案
            </div>
            <div>
              <Tag
                color={studentAnswer!.status === 1 ? 'success' : 'error'}
                style={{ fontSize: '14px', padding: '4px 12px', marginBottom: '8px' }}
              >
                {studentAnswer!.answer || '未作答'}
              </Tag>
              {studentAnswer!.time_spent && (
                <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                  答题耗时: {studentAnswer!.time_spent}秒
                </div>
              )}
              {studentAnswer!.submit_time && (
                <div style={{ marginTop: '4px', color: '#666', fontSize: '12px' }}>
                  提交时间: {new Date(studentAnswer!.submit_time * 1000).toLocaleString()}
                </div>
              )}
              {studentAnswer!.audio_data && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>音频答案：</div>
                  <AudioPlayer src={studentAnswer!.audio_data} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 题目资源 */}
        {question.resource && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>
              题目资源
            </div>
            <div>
              {question.resource_type === 'image' && resourceUrl && (
                <Image
                  src={resourceUrl}
                  alt="题目资源"
                  style={{ maxWidth: '100%', borderRadius: '4px' }}
                  preview={{
                    mask: '预览',
                  }}
                />
              )}
              {question.resource_type === 'audio' && resourceUrl && (
                <AudioPlayer src={resourceUrl} resourceContent={question.resource_content} />
              )}
              {question.resource_type === 'video' && resourceUrl && (
                <video
                  src={resourceUrl}
                  controls
                  style={{ maxWidth: '100%', borderRadius: '4px' }}
                />
              )}
              {!question.resource_type && question.resource_content && (
                <div style={{ padding: '12px', background: '#fafafa', borderRadius: '4px' }}>
                  {question.resource_content}
                </div>
              )}
              {!resourceUrl && question.resource && (
                <div style={{ padding: '12px', background: '#fffbe6', borderRadius: '4px', border: '1px solid #ffe58f' }}>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    资源路径: {question.resource}
                  </div>
                  {question.resource_type && (
                    <div style={{ marginTop: '4px', color: '#666', fontSize: '12px' }}>
                      {question.resource_type === 'image' && '图片资源未生成'}
                      {question.resource_type === 'audio' && '音频资源未生成'}
                      {question.resource_type === 'video' && '视频资源未生成'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 题型 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>
            题型
          </div>
          <Tag>{question.type || '-'}</Tag>
          {question.subtype && (
            <Tag style={{ marginLeft: '8px' }}>{question.subtype}</Tag>
          )}
        </div>

        {/* 难度 */}
        {question.difficulty && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>
              难度
            </div>
            <Tag
              color={
                question.difficulty === 'hard'
                  ? 'red'
                  : question.difficulty === 'medium'
                  ? 'orange'
                  : 'green'
              }
            >
              {question.difficulty === 'hard'
                ? '困难'
                : question.difficulty === 'medium'
                ? '中等'
                : '简单'}
            </Tag>
          </div>
        )}

        {/* 知识点 */}
        {question.knowledge && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>
              知识点
            </div>
            <Tag>{question.knowledge}</Tag>
          </div>
        )}
      </div>
    </Drawer>
  );
}

