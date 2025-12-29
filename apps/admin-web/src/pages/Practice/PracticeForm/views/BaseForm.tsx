import { getSpecialtyOptions, GRADES, STAGE_OPTIONS } from '@ai-education/shared-web';
import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import { usePracticeFormModel } from '../models/page';

export function BaseForm() {
  const { subjects, availableGrades, handleStagesChange } = usePracticeFormModel();
  const form = Form.useFormInstance();
  const subject = Form.useWatch('subject', form);

  return (
    <div className="grid grid-cols-2 gap-4">
      <ProFormText
        name="name"
        label="名称"
        placeholder="练习名称"
        rules={[{ required: true, message: '请输入名称' }]}
      />
      <ProFormText
        name="slug"
        label="标识"
        placeholder="唯一标识，如 daily_practice"
        rules={[
          { required: true, message: '请输入标识' },
          {
            pattern: /^[a-z][a-z0-9_]*$/,
            message: '标识格式：小写字母开头，只能包含小写字母、数字、下划线',
          },
        ]}
      />
      <ProFormSelect
        name="subject"
        label="科目"
        placeholder="请选择科目"
        rules={[{ required: true, message: '请选择科目' }]}
        options={subjects?.map((s: string) => ({ value: s, label: s }))}
      />
      <ProFormSelect
        name="specialty_type"
        label="专项"
        placeholder="请先选择科目，再选择专项类型"
        options={subject ? getSpecialtyOptions(subject) : []}
      />
      <ProFormSelect
        name="stages"
        label="学段"
        mode="multiple"
        placeholder="请选择适用学段"
        options={STAGE_OPTIONS}
        fieldProps={{ onChange: handleStagesChange }}
        rules={[{ required: true, message: '请选择学段' }]}
      />
      <ProFormSelect
        name="grades"
        label="年级"
        mode="multiple"
        placeholder="请选择适用年级"
        options={availableGrades.map((g) => ({
          value: g,
          label: GRADES[g],
        }))}
        rules={[{ required: true, message: '请选择年级' }]}
      />

      <ProFormText
        name="icon"
        label="图标"
        placeholder="图标 emoji 或 URL"
        rules={[{ required: true, message: '请输入图标' }]}
      />
      <ProFormText
        name="description"
        label="描述"
        placeholder="练习描述"
        rules={[{ required: true, message: '请输入描述' }]}
      />
    </div>
  );
}
