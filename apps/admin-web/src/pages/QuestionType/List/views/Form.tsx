import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useQuestionTypeListModel } from '../models/page';
import { useConfigs } from '@/hooks';
import { RESOURCE_TYPE_OPTIONS } from '@/constants/question';

export default function FormView() {
  const { subjectEnum, gradeEnum, questionSceneEmun } = useConfigs();
  const { instance, edited, visible, onCancel, handleSubmit } = useQuestionTypeListModel();

  return (
    <ModalForm<CreateQuestionTypeRequest>
      width={700}
      form={instance}
      open={visible}
      title={edited ? '更新题型' : '新增题型'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 3 }}
    >
      <div className="pt-3" />
      <ProFormText
        name="title"
        label="名称"
        placeholder="请输入题型标题，如：看图选词、根据首字母填空"
        rules={[{ required: true, message: '请输入题型标题' }]}
      />
      <ProFormSelect
        name="scene"
        label="类型"
        placeholder="请选择类型"
        rules={[{ required: true, message: '请选择类型' }]}
        valueEnum={questionSceneEmun}
      />
      <ProFormSelect
        name="subject"
        label="科目"
        placeholder="请选择科目"
        rules={[{ required: true, message: '请选择科目' }]}
        valueEnum={subjectEnum}
        disabled={!!edited}
      />
      <ProFormSelect
        name="grade"
        label="年级"
        placeholder="请选择年级"
        rules={[{ required: true, message: '请选择年级' }]}
        valueEnum={gradeEnum}
        disabled={!!edited}
      />
      <ProFormTextArea
        name="description"
        label="题型描述"
        placeholder="请输入题型描述（可选）"
        fieldProps={{ rows: 3 }}
      />
      <ProFormSelect
        name="resource_type"
        label="资源类型"
        placeholder="请选择资源类型（可选）"
        valueEnum={RESOURCE_TYPE_OPTIONS}
        allowClear
      />
      <ProFormTextArea
        name="prompt"
        label="AI 指令"
        placeholder="请输入生成该题型的 AI 指令（可选）"
        fieldProps={{ rows: 4 }}
      />
    </ModalForm>
  );
}
