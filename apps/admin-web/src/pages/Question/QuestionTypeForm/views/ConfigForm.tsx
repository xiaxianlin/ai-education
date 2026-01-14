import { ProFormTextArea } from '@ant-design/pro-components';
import { Card } from 'antd';

export function ConfigForm() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card title="媒体配置 (media_context)">
        <ProFormTextArea
          name="mediaContext"
          label="媒体配置 JSON"
          placeholder='{"types": ["text", "image"], "configs": {}}'
          fieldProps={{ rows: 6 }}
          extra="定义支持的媒体类型(文本/图片/音视频)及其配置"
        />
      </Card>
      <Card title="脚手架配置 (scaffolding_config)">
        <ProFormTextArea
          name="scaffoldingConfig"
          label="脚手架配置 JSON"
          placeholder='{"mode": "single", "hints": [], "templates": []}'
          fieldProps={{ rows: 6 }}
          extra="定义脚手架模式(单/多选)与交互工具(提示/模板)"
        />
      </Card>
      <Card title="评估配置 (evaluation_config)">
        <ProFormTextArea
          name="evaluationConfig"
          label="评估配置 JSON"
          placeholder='{"mode": "auto_match", "correct_answer": null, "rubrics": []}'
          fieldProps={{ rows: 6 }}
          extra="聚合评估模式(auto_match/ai_analysis)、正确答案参考及评分量表"
        />
      </Card>
    </div>
  );
}

