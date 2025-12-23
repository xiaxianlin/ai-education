import { Space, Tag, Popconfirm, Card, theme } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import { usePracticeConfigModel } from '../models/page';
import { PRACTICE_PARAMETER_VALUE_TYPE_MAP, formatValue } from '../utils';

const AddCard = () => {
  const { showDrawerForm } = usePracticeConfigModel();
  const { token } = theme.useToken();

  return (
    <Card
      hoverable
      style={{
        height: '100%',
        border: `1px dashed ${token.colorBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={() => showDrawerForm()}
    >
      <div style={{ textAlign: 'center' }}>
        <PlusOutlined style={{ fontSize: 32, color: token.colorPrimary, marginBottom: 8 }} />
        <div style={{ color: token.colorPrimary, fontSize: 16, fontWeight: 500 }}>添加参数</div>
      </div>
    </Card>
  );
};

const ParameterCard = ({ record }: { record: PracticeParameter }) => {
  const { removeParameter, showDrawerForm } = usePracticeConfigModel();
  const typeInfo = PRACTICE_PARAMETER_VALUE_TYPE_MAP[record.value_type] || {
    color: 'default',
    label: record.value_type,
  };

  return (
    <Card
      hoverable
      style={{ height: '100%' }}
      title={record.key}
      extra={
        <Space size="small">
          <Tag color={record.type === 'system' ? 'blue' : 'green'}>{record.type === 'system' ? '内置' : '输入'}</Tag>
          <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
          {record.required ? <Tag color="red">必填</Tag> : <Tag>可选</Tag>}
        </Space>
      }
      actions={[
        <EditOutlined key="edit" onClick={() => showDrawerForm(record)} />,
        <Popconfirm
          key="delete"
          title="确定要删除这个参数吗？"
          onConfirm={() => removeParameter(record.key)}
          okText="确定"
          cancelText="取消"
        >
          <DeleteOutlined />
        </Popconfirm>,
      ]}
    >
      <ProDescriptions column={1} layout="vertical">
        <ProDescriptions.Item label="参数值">{formatValue(record.value, record.value_type)}</ProDescriptions.Item>
        <ProDescriptions.Item label="描述">{record.description}</ProDescriptions.Item>
      </ProDescriptions>
    </Card>
  );
};

export function TableView() {
  const { parameters } = usePracticeConfigModel();

  return (
    <div className="grid grid-cols-4 gap-3">
      {parameters.map((record) => (
        <ParameterCard record={record} key={record.key} />
      ))}
      <AddCard />
    </div>
  );
}
