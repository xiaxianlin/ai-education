import './TemplateContent.less';

interface Props {
  content: string;
}

export default function TemplateContent({ content }: Props) {
  return (
    <div className="template-content-wrapper">
      <div className="template-content-header">
        <div className="template-content-title">规则</div>
        <div className="template-content-subtitle">
          提示词模板内容，用于驱动 AI 生成结果
        </div>
      </div>
      <pre className="template-content-pre">
        {content || '暂无模板内容'}
      </pre>
    </div>
  );
}
