import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { usePracticeListModel } from '../models/page';

export default function FormrView() {
  const { drawerOpen, editingId, formLoading, initialValues, handleClose, handleSubmit } = usePracticeListModel();

  return (
    <ModalForm<Practice>
      size="large"
      layout="horizontal"
      labelCol={{ span: 3 }}
      title={editingId ? '编辑练习' : '新建练习'}
      open={drawerOpen}
      onOpenChange={(visible) => {
        if (!visible) handleClose();
      }}
      width={600}
      initialValues={initialValues}
      onFinish={handleSubmit}
      loading={formLoading}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={{
        searchConfig: { submitText: editingId ? '更新' : '创建' },
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
      <ProFormText name="icon" label="图标" />
      <ProFormTextArea name="description" label="描述" fieldProps={{ rows: 4 }} />
    </ModalForm>
  );
}
