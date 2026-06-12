import { toast } from '@/components/ui/toast';
import { useState } from 'react';

interface UseExportOptions {
  /**
   * 导出成功后的提示消息
   */
  successMessage?: string;
  /**
   * 导出失败后的提示消息
   */
  errorMessage?: string;
  /**
   * 加载中的提示消息
   */
  loadingMessage?: string;
  /**
   * 默认文件名（不包含扩展名），会自动添加时间戳
   */
  defaultFilename?: string;
  /**
   * 文件扩展名，默认为 'json'
   */
  fileExtension?: string;
}

/**
 * 通用的导出操作 Hook
 * 封装了文件导出下载的通用逻辑
 *
 * @param service 导出服务函数，返回 Promise<Blob>
 * @param options 配置选项
 * @returns { exporting, handleExport } - 导出状态和处理函数
 */
export function useExport(
  service: () => Promise<Blob>,
  options?: UseExportOptions,
) {
  const {
    successMessage = '导出成功',
    errorMessage = '导出失败',
    loadingMessage = '正在导出数据...',
    defaultFilename = 'export',
    fileExtension = 'json',
  } = options || {};

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      toast.loading({ content: loadingMessage, key: 'export' });

      // 调用导出服务
      const blob = await service();

      // 生成文件名（添加时间戳）
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `${defaultFilename}-${timestamp}.${fileExtension}`;

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 释放 URL 对象
      URL.revokeObjectURL(url);

      toast.destroy('export');
      toast.success(successMessage);
    } catch (error) {
      toast.destroy('export');
      toast.error(errorMessage + '：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    handleExport,
  };
}
