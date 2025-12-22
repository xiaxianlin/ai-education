import { useState, useEffect } from 'react';
import { Button, message, Input } from 'antd';
import { usePracticeConfigModel } from '../models/page';

const { TextArea } = Input;

export function JSONView() {
  const { parameters, setParameters } = usePracticeConfigModel();
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');
  const [originalParams, setOriginalParams] = useState<PracticeParameter[]>([]);

  // 当参数列表变化时，更新 JSON 文本
  useEffect(() => {
    if (parameters && parameters.length > 0) {
      setJsonText(JSON.stringify(parameters, null, 2));
      setOriginalParams([...parameters]);
    } else {
      setJsonText('[]');
      setOriginalParams([]);
    }
    setJsonError('');
  }, [parameters]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonText(value);

    // 实时验证 JSON 格式
    try {
      JSON.parse(value);
      setJsonError('');
    } catch (error: any) {
      setJsonError(error.message);
    }
  };

  const handleApply = () => {
    try {
      // 解析 JSON
      const jsonData = JSON.parse(jsonText);

      // 验证数据是数组
      if (!Array.isArray(jsonData)) {
        message.error('JSON 必须是数组格式');
        return;
      }

      // 验证每个参数
      for (const param of jsonData) {
        if (!param.key || !param.type || !param.value_type) {
          message.error(`参数缺少必填字段：key、type 或 value_type`);
          return;
        }
      }

      // 检查 key 唯一性
      const keys = jsonData.map((p: any) => p.key);
      if (keys.length !== new Set(keys).size) {
        message.error('参数标识不能重复');
        return;
      }

      // 更新参数列表（前端状态）
      const processedParams: PracticeParameter[] = jsonData.map((param: any) => {
        let processedValue = param.value || '';

        if (param.value_type === 'number' && processedValue) {
          const num = Number(processedValue);
          if (isNaN(num)) {
            throw new Error(`参数 ${param.key} 的 value 必须是有效的数字`);
          }
          processedValue = String(num);
        } else if (param.value_type === 'object' || param.value_type === 'array') {
          if (processedValue && processedValue.trim()) {
            try {
              const parsed = typeof processedValue === 'string' ? JSON.parse(processedValue) : processedValue;
              processedValue = JSON.stringify(parsed, null, 0);
            } catch (e) {
              throw new Error(`参数 ${param.key} 的 value 必须是有效的 JSON 字符串`);
            }
          }
        } else if (param.value_type === 'string') {
          processedValue = String(processedValue || '');
        }

        return {
          ...param,
          value: processedValue,
        };
      });

      // 批量更新参数列表
      setParameters(processedParams);
      message.success('参数已更新，请点击保存按钮提交更改');
    } catch (error: any) {
      message.error(error?.message || '更新失败');
    }
  };

  const handleReset = () => {
    if (originalParams.length > 0) {
      setJsonText(JSON.stringify(originalParams, null, 2));
      setParameters([...originalParams]);
    } else {
      setJsonText('[]');
      setParameters([]);
    }
    setJsonError('');
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Button type="primary" onClick={handleApply} disabled={!!jsonError}>
            应用更改
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={handleReset}>
            重置
          </Button>
        </div>
        {jsonError && <div style={{ color: '#ff4d4f', fontSize: 12 }}>JSON 格式错误: {jsonError}</div>}
      </div>
      <TextArea
        value={jsonText}
        onChange={handleJsonChange}
        placeholder="请输入 JSON 格式的参数配置"
        autoSize={{ minRows: 20, maxRows: 30 }}
        style={{
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
          fontSize: '13px',
          lineHeight: '1.6',
        }}
        status={jsonError ? 'error' : undefined}
      />
      <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
        提示：直接在文本框中编辑 JSON 格式的参数，修改后点击"应用更改"更新参数列表，然后点击"保存"提交所有更改。
      </div>
    </div>
  );
}
