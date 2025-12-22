import { Table, Button, Space, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePracticeConfigModel } from '../models/page';

export function TableView() {
  const { parameters, removeParameter, showDrawerForm } = usePracticeConfigModel();
  const columns: ColumnsType<PracticeParameter> = [
    {
      title: '参数标识',
      dataIndex: 'key',
      key: 'key',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <Tag color={type === 'system' ? 'blue' : 'green'}>{type === 'system' ? '内置' : '输入'}</Tag>,
    },
    {
      title: '值类型',
      dataIndex: 'value_type',
      key: 'value_type',
      width: 100,
      render: (valueType) => {
        const typeMap: Record<string, { color: string; label: string }> = {
          string: { color: 'default', label: '字符串' },
          number: { color: 'orange', label: '数字' },
          object: { color: 'purple', label: '对象' },
          array: { color: 'cyan', label: '数组' },
        };
        const typeInfo = typeMap[valueType] || { color: 'default', label: valueType };
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: 200,
      ellipsis: true,
      render: (value, record) => {
        if (!value) return '-';

        // For object or array types, ensure we display as JSON string
        if (record.value_type === 'object' || record.value_type === 'array') {
          try {
            // If value is already a string, try to parse and re-stringify for consistency
            if (typeof value === 'string') {
              const parsed = JSON.parse(value);
              return JSON.stringify(parsed);
            }
            // If value is an object/array, stringify it
            return JSON.stringify(value);
          } catch (e) {
            // If parsing fails but it's a string, return as-is
            if (typeof value === 'string') {
              return value;
            }
            // Last resort: try to stringify whatever it is
            try {
              return JSON.stringify(value);
            } catch {
              return String(value);
            }
          }
        }

        // For other types, convert to string
        return String(value);
      },
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (required) => (required ? <Tag color="red">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showDrawerForm(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个参数吗？"
            onConfirm={() => removeParameter(record.key)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showDrawerForm()}>
          添加参数
        </Button>
      </div>
      <Table<PracticeParameter> columns={columns} dataSource={parameters} rowKey="key" pagination={false} bordered />
    </>
  );
}
