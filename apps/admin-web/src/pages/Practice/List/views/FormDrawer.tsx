import { ProForm, ProFormText, ProFormTextArea, ProFormSelect } from '@ant-design/pro-components';
import { Drawer } from 'antd';
import { usePracticeListModel } from '../models/page';

export default function FormDrawerView() {
  const { drawerOpen, editingId, formLoading, initialValues, handleClose, handleSubmit } = usePracticeListModel();

  return (
    <Drawer
      title={editingId ? '编辑练习' : '新建练习'}
      open={drawerOpen}
      onClose={handleClose}
      width={600}
      destroyOnClose
    >
      <ProForm<Practice>
        loading={formLoading}
        initialValues={initialValues}
        onFinish={handleSubmit}
        submitter={{
          searchConfig: {
            submitText: editingId ? '更新' : '创建',
          },
        }}
      >
        <ProFormText name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]} />
        <ProFormText
          name="slug"
          label="标识"
          rules={[
            { required: true, message: '请输入标识' },
            { pattern: /^[a-z0-9_-]+$/, message: '标识只能包含小写字母、数字、下划线和连字符' },
          ]}
          disabled={!!editingId}
        />
        <ProFormSelect
          name="type"
          label="类型"
          rules={[{ required: true, message: '请选择类型' }]}
          options={[
            { label: '系统', value: 'system' },
            { label: '自定义', value: 'custom' },
          ]}
          disabled={!!editingId}
        />
        <ProFormTextArea name="description" label="描述" fieldProps={{ rows: 4 }} />
        <ProFormText name="icon" label="图标URL" />
      </ProForm>
    </Drawer>
  );
}
