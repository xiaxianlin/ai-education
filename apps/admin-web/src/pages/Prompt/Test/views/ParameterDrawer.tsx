import { Drawer, Form, Input, InputNumber, Switch, Button, Space, message } from 'antd';
import { useEffect } from 'react';
import { TemplateParameter, validateParameter } from '../utils/templateParser';

interface Props {
  visible: boolean;
  onClose: () => void;
  parameters: TemplateParameter[];
  values: Record<string, any>;
  onSave: (values: Record<string, any>) => void;
}

export default function ParameterDrawer({ visible, onClose, parameters, values, onSave }: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(values);
    }
  }, [visible, values, form]);

  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();

      // 验证所有参数
      const errors: string[] = [];
      parameters.forEach(param => {
        const validation = validateParameter(param, formValues[param.name]);
        if (!validation.valid) {
          errors.push(validation.error!);
        }
      });

      if (errors.length > 0) {
        message.error(errors.join('; '));
        return;
      }

      onSave(formValues);
      onClose();
      message.success('参数保存成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const renderFormField = (parameter: TemplateParameter) => {
    const commonProps = {
      key: parameter.name,
      name: parameter.name,
      label: parameter.name,
      tooltip: (parameter as any).description || '',
      rules: [{ required: parameter.required, message: `请输入 ${parameter.name}` }],
    };

    switch ((parameter as any).type) {
      case 'number':
        return (
          <Form.Item {...commonProps}>
            <InputNumber
              style={{ width: '100%' }}
              placeholder={`请输入 ${parameter.name}`}
            />
          </Form.Item>
        );

      case 'boolean':
        return (
          <Form.Item {...commonProps} valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        );

      case 'object':
        return (
          <Form.Item
            {...commonProps}
            rules={[
              { required: parameter.required, message: `请输入 ${parameter.name}` },
              {
                validator: async (_: any, value: string) => {
                  if (!value) return Promise.resolve();
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject(new Error('请输入有效的 JSON 格式'));
                  }
                },
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder={`请输入 ${parameter.name} (JSON 格式)`}
            />
          </Form.Item>
        );

      default:
        return (
          <Form.Item {...commonProps}>
            <Input placeholder={`请输入 ${parameter.name}`} />
          </Form.Item>
        );
    }
  };

  return (
    <Drawer
      title="参数设置"
      placement="right"
      width={500}
      open={visible}
      onClose={onClose}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        {parameters.map(renderFormField)}
      </Form>
    </Drawer>
  );
}
