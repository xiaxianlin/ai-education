import { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import ReactJson from 'react-json-view';

export function JSONView() {
  const [jsonData, setJsonData] = useState<PracticeParameter[]>([]);

  // 当参数列表变化时，更新 JSON 数据
  useEffect(() => {
    if (parameters.length > 0) {
      setJsonData([...parameters]);
    } else {
      setJsonData([]);
    }
  }, [parameters]);

  const handleJsonChange = (edit: any) => {
    if (edit.updated_src) {
      setJsonData(edit.updated_src);
    }
  };

  const handleApply = () => {
    try {
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
      const keys = jsonData.map((p) => p.key);
      if (keys.length !== new Set(keys).size) {
        message.error('参数标识不能重复');
        return;
      }

      // 更新参数列表（前端状态）
      const processedParams: PracticeParameter[] = jsonData.map((param) => {
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
      onApply(processedParams);
      message.success('参数已更新，请点击保存按钮提交更改');
    } catch (error: any) {
      message.error(error?.message || '更新失败');
    }
  };

  const handleReset = () => {
    if (parameters.length > 0) {
      setJsonData([...parameters]);
    } else {
      setJsonData([]);
    }
    onReset();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Button onClick={handleApply}>应用更改</Button>
          <Button style={{ marginLeft: 8 }} onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>
      <div
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          padding: '16px',
          backgroundColor: '#fff',
          minHeight: '500px',
          maxHeight: '600px',
          overflow: 'auto',
        }}
      >
        <ReactJson
          src={jsonData}
          onEdit={handleJsonChange}
          onAdd={handleJsonChange}
          onDelete={handleJsonChange}
          theme="rjv-default"
          collapsed={false}
          enableClipboard={true}
          displayDataTypes={true}
          displayObjectSize={true}
          indentWidth={2}
          name={false}
          iconStyle="circle"
          style={{
            fontSize: '13px',
            fontFamily: 'monospace',
          }}
        />
      </div>
      <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
        提示：直接在 JSON 视图中编辑参数，修改后点击"应用更改"更新参数列表，然后点击"保存"提交所有更改。
      </div>
    </div>
  );
}
