import { ModalForm, ProForm, ProFormDigit, ProFormList, ProFormText } from '@ant-design/pro-components';
import { usePracticeConfigModel } from '../models/page';

export default function ConfigModalView() {
  const {
    configModalOpen,
    editingPractice,
    configLoading,
    handleCloseConfig,
    handleSaveConfig,
  } = usePracticeConfigModel();

  if (!editingPractice) return null;

  const defaultConfig = editingPractice.config?.default || {};
  const gradeSpecific = editingPractice.config?.grade_specific || {};

  return (
    <ModalForm<SavePracticeConfigRequest>
      width={700}
      open={configModalOpen}
      title={`配置：${editingPractice.name}`}
      loading={configLoading}
      initialValues={{
        config: {
          default: {
            generate_count: defaultConfig.generate_count || 15,
            recall_count: defaultConfig.recall_count || 0,
          },
          grade_specific: Object.keys(gradeSpecific).map((grade) => ({
            grade,
            generate_count: gradeSpecific[grade]?.generate_count || 15,
            recall_count: gradeSpecific[grade]?.recall_count || 0,
          })),
        },
      }}
      onFinish={async (values) => {
        // 转换 grade_specific 数组为对象格式
        const config: any = {
          default: values.config.default,
        };
        
        if (values.config.grade_specific && Array.isArray(values.config.grade_specific)) {
          config.grade_specific = {};
          values.config.grade_specific.forEach((item: any) => {
            if (item.grade) {
              config.grade_specific[item.grade] = {
                generate_count: item.generate_count,
                recall_count: item.recall_count,
              };
            }
          });
        }
        
        await handleSaveConfig(config);
        return true;
      }}
      modalProps={{
        destroyOnClose: true,
        onCancel: handleCloseConfig,
      }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 5 }}
      submitter={{
        searchConfig: {
          submitText: '保存',
        },
      }}
    >
      <div className="pt-3" />
      <ProForm.Group title="默认配置">
        <ProFormDigit
          name={['config', 'default', 'generate_count']}
          label="生成题目数量"
          min={1}
          fieldProps={{ precision: 0 }}
          width="md"
        />
        <ProFormDigit
          name={['config', 'default', 'recall_count']}
          label="召回题目数量"
          min={0}
          fieldProps={{ precision: 0 }}
          width="md"
        />
      </ProForm.Group>
      
      <ProFormList
        name={['config', 'grade_specific']}
        label="年级个性化配置"
        copyIconProps={false}
        deleteIconProps={{ tooltipText: '删除' }}
        creatorButtonProps={{ creatorButtonText: '添加年级配置' }}
      >
        <ProForm.Group>
          <ProFormText
            name="grade"
            label="年级"
            rules={[{ required: true, message: '请输入年级' }]}
            width="sm"
          />
          <ProFormDigit
            name="generate_count"
            label="生成题目数量"
            min={1}
            fieldProps={{ precision: 0 }}
            width="sm"
          />
          <ProFormDigit
            name="recall_count"
            label="召回题目数量"
            min={0}
            fieldProps={{ precision: 0 }}
            width="sm"
          />
        </ProForm.Group>
      </ProFormList>
    </ModalForm>
  );
}

