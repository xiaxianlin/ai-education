import { TextbookVersionApi } from '@/pages/TextbookVersion/api';
import { ProFormSelect } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { useMemo } from 'react';

interface TextbookVersionSelectProps {
  name?: string;
  subject?: string;
}

export function TextbookVersionSelect({ name = 'version', subject }: TextbookVersionSelectProps) {
  // 根据科目获取版本列表
  const { data: versions, loading: versionsLoading } = useRequest(
    () => TextbookVersionApi.searchTextbookVersions({ subject }),
    {
      ready: !!subject,
      refreshDeps: [subject],
    },
  );

  // 将版本列表转换为 valueEnum 格式，格式为 "版本名称(年份)"
  const versionValueEnum = useMemo(() => {
    if (!versions || versions.length === 0) {
      return {};
    }
    return versions.reduce(
      (prev, version) => {
        const versionString = `${version.name}|${version.revision_year}`;
        return { ...prev, [versionString]: versionString };
      },
      {} as Record<string, string>,
    );
  }, [versions]);

  return (
    <ProFormSelect
      name={name}
      label="版本"
      placeholder="请选择版本"
      rules={[{ required: true }]}
      valueEnum={versionValueEnum}
      fieldProps={{
        loading: versionsLoading,
        disabled: !subject || versionsLoading,
      }}
    />
  );
}
