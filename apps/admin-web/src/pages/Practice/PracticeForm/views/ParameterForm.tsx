import { Card, Flex, Form } from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import { ParameterConfigForm } from '../components';

export function ParameterForm() {
  return (
    <Form.Item noStyle>
      <Form.List name="parameter_config">
        {(fields, { add, remove }) => (
          <div className="grid grid-cols-3 gap-4">
            {fields.map(({ key, name }) => (
              <ParameterConfigForm key={key} name={name} onDelete={() => remove(name)} />
            ))}
            <Card
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 376,
                borderStyle: 'dashed',
              }}
            >
              <Flex align="center" justify="center" vertical gap={8}>
                <PlusOutlined
                  style={{ fontSize: 48, color: 'var(--ant-color-primary)' }}
                  onClick={() => add({ key: '', name: '', value_type: 'string', description: '', required: true })}
                />
              </Flex>
            </Card>
          </div>
        )}
      </Form.List>
    </Form.Item>
  );
}
