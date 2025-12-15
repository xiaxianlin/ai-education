import { Button, FormInstance } from 'antd';
import { PromptVersionForm } from './PromptVersionForm';
import { VersionFormValues } from '../../types';

type Props = {
  form: FormInstance<VersionFormValues>;
  onCreate: () => Promise<void>;
};

export function VersionCreator({ form, onCreate }: Props) {
  return (
    <>
      <PromptVersionForm form={form} />
      <Button type="primary" onClick={onCreate} style={{ marginTop: 16 }}>
        创建版本
      </Button>
    </>
  );
}
