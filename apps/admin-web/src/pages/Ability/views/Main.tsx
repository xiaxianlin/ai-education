import { Button, Card, CardContent, Field, PageShell, Select } from '@/components/ui';
import { useConfigs } from '@/hooks';
import { GRADES } from '@ai-education/shared-web';
import { Download, Plus, RotateCcw, Trash2, Upload } from 'lucide-react';
import { ChangeEvent } from 'react';
import { useAbilityModel } from '../models/page';
import AbilityForm from './AbilityForm';
import AbilityList from './AbilityList';

export default function MainView() {
  const { subjects } = useConfigs();
  const {
    subject,
    grade,
    setSubject,
    setGrade,
    formProps,
    exporting,
    importing,
    selectedRowKeys,
    batchDeleteAbilities,
    batchDeleteLoading,
    handleExport,
    importAbilities,
    validateFile,
  } = useAbilityModel();
  const gradeOptions = Object.keys(GRADES).map((key) => Number(key));

  const resetFilter = () => {
    setSubject('');
    setGrade(undefined);
  };

  const handleBatchDeleteClick = () => {
    if (selectedRowKeys.length === 0) return;
    if (window.confirm(`确定要删除选中的 ${selectedRowKeys.length} 个能力吗？此操作无法恢复。`)) {
      batchDeleteAbilities(selectedRowKeys as number[]);
    }
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !validateFile(file)) return;
    if (!subject || !grade) {
      window.alert('请先选择学科和年级');
      return;
    }
    const confirmed = window.confirm(
      `导入操作将删除当前年级的所有现有能力数据。\n文件：${file.name}\n学科：${subject}\n年级：${grade}年级\n确定要继续导入吗？`,
    );
    if (confirmed) {
      importAbilities(file);
    }
  };

  return (
    <PageShell title="能力管理" description="维护学科年级下的能力点、难度和状态。">
      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="学科">
              <Select value={subject || ''} onChange={(event) => setSubject(event.target.value)}>
                <option value="">全部学科</option>
                {subjects.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="年级">
              <Select
                value={grade || ''}
                onChange={(event) => setGrade(event.target.value ? Number(event.target.value) : undefined)}
              >
                <option value="">全部年级</option>
                {gradeOptions.map((item) => (
                  <option key={item} value={item}>
                    {GRADES[item]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
            <Button variant="outline" icon={<RotateCcw className="size-4" />} onClick={resetFilter}>
              重置
            </Button>
            <Button variant="outline" icon={<Download className="size-4" />} loading={exporting} onClick={handleExport}>
              导出
            </Button>
            <label className="inline-flex">
              <input accept=".json" className="sr-only" disabled={importing} type="file" onChange={handleUpload} />
              <Button variant="outline" icon={<Upload className="size-4" />} loading={importing}>
                导入
              </Button>
            </label>
            <Button
              variant="outline"
              className="text-destructive"
              icon={<Trash2 className="size-4" />}
              disabled={selectedRowKeys.length === 0}
              loading={batchDeleteLoading}
              onClick={handleBatchDeleteClick}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
            <Button icon={<Plus className="size-4" />} onClick={() => formProps.showForm()}>
              新增能力
            </Button>
          </div>
        </CardContent>
      </Card>
      <AbilityList />
      <AbilityForm />
    </PageShell>
  );
}
