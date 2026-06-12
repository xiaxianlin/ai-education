import { Button, Field, Input, Modal, Select, Textarea } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { PracticeType } from '@ai-education/shared-web';
import { useEffect, useState } from 'react';
import { useQuestionTypeModel } from '../models/page';

export function QuestionTypeFormModal() {
  const { visible, type, item, abilityOptions, loading, onCancel, handleSubmit } = useQuestionTypeModel();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [abilityCode, setAbilityCode] = useState('');
  const [description, setDescription] = useState('');

  const prefix = item ? '编辑' : '新增';
  const title = `${prefix} ${type === PracticeType.UNIT_PRACTICE ? '单元练习' : '能力练习'}`;

  useEffect(() => {
    if (!visible) return;
    setName(item?.name || '');
    setCode(item?.code || '');
    setAbilityCode(item?.ability_code || '');
    setDescription(item?.description || '');
  }, [visible, item]);

  const submit = () => {
    if (!name.trim()) {
      toast.error('请输入名称');
      return;
    }
    if (!/^[a-z][a-z0-9_]*$/.test(code)) {
      toast.error('编码格式：小写字母开头，只能包含小写字母、数字、下划线');
      return;
    }
    if (type === PracticeType.ABILITY_PRACTICE && !abilityCode) {
      toast.error('请选择能力');
      return;
    }

    handleSubmit({
      name,
      code,
      ability_code: abilityCode || undefined,
      description,
      category: type,
      configs: item?.configs || {},
    });
  };

  return (
    <Modal
      open={visible}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            取消
          </Button>
          <Button onClick={submit} loading={loading}>
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="名称" required>
          <Input
            placeholder="题型名称，如 看图选拼音"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="编码" required>
          <Input
            placeholder="唯一标识，如 pinyin_choice"
            value={code}
            disabled={!!item}
            onChange={(event) => setCode(event.target.value)}
          />
        </Field>
        {type === PracticeType.ABILITY_PRACTICE ? (
          <Field label="能力" required>
            <Select
              value={abilityCode}
              onChange={(event) => setAbilityCode(event.target.value)}
            >
              <option value="">请选择能力</option>
              {abilityOptions?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        <Field label="描述">
          <Textarea
            placeholder="题型描述（可选）"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
