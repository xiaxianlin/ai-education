import { Button, Field, Input, Modal, Rating, Switch, Textarea } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { FormEvent, useEffect, useState } from 'react';

import type { CreateAbilityRequest, UpdateAbilityRequest } from '../api';
import { useAbilityModel } from '../models/page';

export default function AbilityFormView() {
  const { formProps } = useAbilityModel();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!formProps.visible) return;
    setName(formProps.item?.name || '');
    setCode(formProps.item?.code || '');
    setDifficulty(formProps.item?.difficulty || 1);
    setDescription(formProps.item?.description || '');
    setIsActive((formProps.item?.is_active ?? 1) === 1);
  }, [formProps.item, formProps.visible]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !code) {
      toast.error('请填写能力名称和能力标识');
      return;
    }

    const values: CreateAbilityRequest | UpdateAbilityRequest = {
      name,
      code,
      difficulty,
      description,
    };
    if (formProps.item) {
      values.is_active = isActive ? 1 : 0;
    }
    formProps.handleSubmit(values);
  };

  return (
    <Modal
      open={formProps.visible}
      title={formProps.item ? '更新能力' : '新增能力'}
      onClose={formProps.onCancel}
      footer={
        <>
          <Button variant="outline" onClick={formProps.onCancel}>
            取消
          </Button>
          <Button loading={formProps.loading} type="submit" form="ability-form">
            保存
          </Button>
        </>
      }
    >
      <form id="ability-form" className="grid gap-4" onSubmit={onSubmit}>
        <Field label="能力名称" required>
          <Input placeholder="请输入能力名称" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="能力标识" required>
          <Input
            placeholder="请输入能力标识（如：pinyin_reading）"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </Field>
        <Field label="难度" required>
          <Rating value={difficulty} onChange={setDifficulty} />
        </Field>
        <Field label="能力说明">
          <Textarea
            placeholder="请输入能力说明"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        {formProps.item ? (
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <span className="text-sm font-medium text-foreground">启用状态</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
