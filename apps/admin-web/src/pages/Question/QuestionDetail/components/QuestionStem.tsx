import { AudioPlayer } from '@/components';
import { getResourceUrl } from '@ai-education/shared-web';
import { ProCard } from '@ant-design/pro-components';
import { Flex, Image, Typography } from 'antd';
import { useQuestionResources } from '../hooks/useQuestionResources';

interface QuestionStemProps {
  question: Question;
}

export function QuestionStem({ question }: QuestionStemProps) {
  const { stemImageResources, stemAudioResources, stemResources } = useQuestionResources(question);

  // 从 content 字段获取题干
  const content = question.content || {};
  const stem = content.stem || "";
  const stemText = typeof stem === "string" ? stem : (stem as Stem)?.text || "";
  const stemRichText = typeof stem === "object" ? (stem as Stem)?.rich_text : undefined;
  const hasRichText = !!stemRichText;
  const stemContent = stemRichText || stemText || '';

  return (
    <ProCard title="题目内容" bordered={false}>
      {/* 题干文本（支持富文本） */}
      {hasRichText ? (
        <div dangerouslySetInnerHTML={{ __html: stemContent }} style={{ wordBreak: 'break-word' }} />
      ) : (
        <Typography.Paragraph style={{ wordBreak: 'break-word' }}>{stemContent || '-'}</Typography.Paragraph>
      )}

      {/* 题干音频（向后兼容：stem.audio_url） */}
      {typeof stem === "object" && (stem as Stem)?.audio_url && (
        <div style={{ marginTop: '16px' }}>
          <AudioPlayer src={getResourceUrl((stem as Stem).audio_url!) ?? ''} />
        </div>
      )}

      {/* 题干资源（图片） */}
      {stemImageResources.length > 0 && (
        <Flex gap={16} wrap="wrap" style={{ marginTop: '20px' }}>
          {stemImageResources.map((res, index) => (
            <div key={res.id || index}>
              <Image
                src={getResourceUrl(res.url) ?? undefined}
                alt={res.alt || '题目图片'}
                width={120}
                style={{ objectFit: 'contain' }}
                preview={{ mask: '预览' }}
              />
              {res.transcript && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>{res.transcript}</div>
              )}
            </div>
          ))}
        </Flex>
      )}

      {/* 题干资源（音频） */}
      {stemAudioResources.map((res, index) => (
        <div key={res.id || index} style={{ marginTop: '16px' }}>
          <AudioPlayer src={getResourceUrl(res.url) ?? ''} resourceContent={res.transcript} />
        </div>
      ))}

      {/* 资源缺失提示 */}
      {stemResources.length === 0 &&
        (question.question_type_code.includes('image') || question.question_type_code.includes('audio')) && (
          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              background: '#fffbe6',
              borderRadius: '4px',
              border: '1px solid #ffe58f',
              color: '#666',
            }}
          >
            该题目需要多媒体资源，但尚未生成。
          </div>
        )}
    </ProCard>
  );
}

