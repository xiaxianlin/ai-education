import { Field, Select } from '@/components/ui';
import { TextbookVersionApi } from '@/pages/TextbookVersion/api';
import { useRequest } from 'ahooks';
import { useMemo } from 'react';

interface TextbookVersionSelectProps {
  name?: string;
  subject?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function TextbookVersionSelect({ subject, value, onChange }: TextbookVersionSelectProps) {
  const { data: versions, loading: versionsLoading } = useRequest(
    () => TextbookVersionApi.searchTextbookVersions({ subject }),
    {
      ready: !!subject,
      refreshDeps: [subject],
    },
  );

  const options = useMemo(() => {
    return (versions || []).map((version) => {
      const versionString = `${version.name}|${version.revision_year}`;
      return { label: versionString, value: versionString };
    });
  }, [versions]);

  return (
    <Field label="版本" required>
      <Select value={value || ''} disabled={!subject || versionsLoading} onChange={(event) => onChange?.(event.target.value)}>
        <option value="">{versionsLoading ? '加载中...' : '请选择版本'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}
