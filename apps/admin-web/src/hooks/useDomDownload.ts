import { useRef } from 'react';
import { message } from 'antd';
import { useRequest } from 'ahooks';
import html2canvas from 'html2canvas';

interface UseDomDownloadProps {
  success?: string;
  error?: string;
}

export function useDomDownload(props?: UseDomDownloadProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { loading, run: download } = useRequest(
    async (filename = 'download.png') => {
      if (!ref.current) return;

      const canvas = await html2canvas(ref.current, { useCORS: true });

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    },
    {
      manual: true,
      onSuccess: () => message.success(props?.success || '下载成功'),
      onError: () => message.success(props?.error || '下载失败'),
    },
  );

  return { ref, loading, download };
}
