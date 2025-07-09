import { Form, Modal, Select } from 'antd';
import { useMemo, useState } from 'react';
import { getGradeList, provinceList, stageList } from '../../utils/data';
import { useQuestionResolveModel } from '../../models/page';

export function ProfileForm() {
  const { form, visible, profile, hide, submit } = useQuestionResolveModel();
  const [stage, setStage] = useState(profile?.stage);

  const privince_options = useMemo(() => {
    return provinceList.map(({ name }) => ({ value: name, label: name }));
  }, []);

  const stage_options = useMemo(() => {
    return stageList.map((name) => ({ value: name, label: name }));
  }, []);

  const grade_options = useMemo(
    () => getGradeList(stage || '小学').map((name) => ({ value: name, label: name })),
    [stage],
  );

  return (
    <Modal
      title="设置信息"
      maskClosable={false}
      open={visible}
      okButtonProps={{ size: 'large', style: { width: 100 } }}
      cancelButtonProps={{ size: 'large', style: { width: 100 } }}
      onOk={submit}
      onCancel={hide}
    >
      <div style={{ marginBottom: 20 }}></div>
      <Form size="large" form={form} labelCol={{ span: 4 }} autoComplete="off">
        <Form.Item<ProfileFormModel> label="省份" name="province" rules={[{ required: true }]}>
          <Select placeholder="请选择省份" options={privince_options} />
        </Form.Item>
        <Form.Item<ProfileFormModel> label="阶段" name="stage" rules={[{ required: true }]}>
          <Select
            placeholder="请选择阶段"
            options={stage_options}
            onChange={(value) => {
              setStage(value);
              form.setFieldValue('grade', '一年级');
            }}
          />
        </Form.Item>
        <Form.Item<ProfileFormModel> label="年级" name="grade" rules={[{ required: true }]}>
          <Select placeholder="请选择年级" options={grade_options} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
