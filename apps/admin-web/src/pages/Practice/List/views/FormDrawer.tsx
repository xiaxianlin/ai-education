import { ProForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Drawer } from 'antd';
import { usePracticeListModel } from '../models/page';
import { PRACTICE_TYPE_LABELS } from '@/constants/practice';

const PRACTICE_TYPE_OPTIONS = [
  { label: '日常练习', value: 'daily_practice' },
  { label: '单元练习', value: 'unit_practice' },
  { label: '综合评估', value: 'assessment' },
];

const TYPE_OPTIONS = [
  { label: '系统', value: 'system' },
  { label: '自定义', value: 'custom' },
];

export default function FormDrawerView() {
  const {
    drawerOpen,
    editingId,
    formLoading,
    initialValues,
    handleClose,
    handleSubmit,
  } = usePracticeListModel();

  return (
    <Drawer
      title={editingId ? '编辑练习' : '新建练习'}
      open={drawerOpen}
      onClose={handleClose}
      width={600}
      destroyOnClose
    >
      <ProForm<SavePracticeRequest>
        loading={formLoading}
        initialValues={initialValues}
        onFinish={handleSubmit}
        submitter={{
          searchConfig: {
            submitText: editingId ? '更新' : '创建',
          },
        }}
      >
        <ProFormSelect
          name="type"
          label="类型"
          rules={[{ required: true, message: '请选择类型' }]}
          options={TYPE_OPTIONS}
          disabled={editingId && initialValues?.type === 'system'}
        />
        <ProFormText
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        />
        <ProFormText
          name="slug"
          label="标识"
          rules={[
            { required: true, message: '请输入标识' },
            { pattern: /^[a-z0-9_-]+$/, message: '标识只能包含小写字母、数字、下划线和连字符' },
          ]}
        />
        <ProFormSelect
          name="practice_type"
          label="练习类型"
          options={PRACTICE_TYPE_OPTIONS}
          dependencies={['type']}
          rules={[
            ({ getFieldValue }) => ({
              validator: (_, value) => {
                const type = getFieldValue('type');
                if (type === 'system' && !value) {
                  return Promise.reject(new Error('系统练习必须选择练习类型'));
                }
                return Promise.resolve();
              },
            }),
          ]}
          disabled={editingId && initialValues?.type === 'system'}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          fieldProps={{ rows: 4 }}
        />
        <ProFormText
          name="icon"
          label="图标URL"
        />
      </ProForm>
    </Drawer>
  );
}

