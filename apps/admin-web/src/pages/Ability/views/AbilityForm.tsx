import { Button, Field, Input, Modal, Rating, Select, Switch, Textarea } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { useConfigs } from '@/hooks';
import { GRADES } from '@ai-education/shared-web';
import { FormEvent, useEffect, useState } from 'react';

import type { CreateAbilityRequest, UpdateAbilityRequest } from '../api';
import { useAbilityModel } from '../models/page';

export default function AbilityFormView() {
  const { subjects } = useConfigs();
  const { formProps, subject, grade } = useAbilityModel();
  const gradeOptions = Object.keys(GRADES).map((key) => Number(key));
  const [formSubject, setFormSubject] = useState('');
  const [formGrade, setFormGrade] = useState<number | undefined>();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!formProps.visible) return;
    setFormSubject(formProps.item?.subject || subject || '');
    setFormGrade(formProps.item?.grade || grade);
    setName(formProps.item?.name || '');
    setCode(formProps.item?.code || '');
    setDifficulty(formProps.item?.difficulty || 1);
    setDescription(formProps.item?.description || '');
    setIsActive((formProps.item?.is_active ?? 1) === 1);
  }, [formProps.item, formProps.visible, grade, subject]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !code) {
      toast.error('请填写能力名称和能力标识');
      return;
    }
    if (!formProps.item && (!formSubject || !formGrade)) {
      toast.error('请选择学科和年级');
      return;
    }

    if (formProps.item) {
      const values: UpdateAbilityRequest = {
        name,
        code,
        difficulty,
        description,
        is_active: isActive ? 1 : 0,
      };
      formProps.handleSubmit(values);
      return;
    }

    const values: CreateAbilityRequest = {
      subject: formSubject,
      grade: formGrade as number,
      name,
      code,
      difficulty,
      description,
    };
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
        {!formProps.item ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="学科" required>
              <Select value={formSubject} onChange={(event) => setFormSubject(event.target.value)}>
                <option value="">请选择学科</option>
                {subjects.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="年级" required>
              <Select
                value={formGrade || ''}
                onChange={(event) => setFormGrade(event.target.value ? Number(event.target.value) : undefined)}
              >
                <option value="">请选择年级</option>
                {gradeOptions.map((item) => (
                  <option key={item} value={item}>
                    {GRADES[item]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : null}
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
