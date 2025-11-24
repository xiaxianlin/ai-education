import React from 'react';
import { Modal, Spin } from 'antd';

export interface GenerateConfirmOptions {
  /** 确认对话框标题 */
  confirmTitle?: string;
  /** 确认对话框内容 */
  confirmContent: string;
  /** 确认对话框图标 */
  confirmIcon?: React.ReactNode;
  /** 确认按钮文字 */
  okText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** Loading 弹窗标题 */
  loadingTitle: string;
  /** Loading 弹窗内容 */
  loadingContent: string;
  /** 成功提示标题 */
  successTitle?: string;
  /** 成功提示内容 */
  successContent?: string;
  /** 失败提示标题 */
  errorTitle?: string;
  /** 失败提示内容（支持函数，接收错误对象） */
  errorContent?: string | ((error: any) => string);
  /** 成功后的回调 */
  onSuccess?: () => void;
  /** 失败后的回调 */
  onError?: (error: any) => void;
}

/**
 * 通用的生成题目/练习的确认和 Loading Hook
 * 
 * @param generateFn 执行生成操作的异步函数
 * @param options 配置选项
 * @returns 返回一个函数，调用时会先显示确认对话框，确认后执行生成操作
 */
export function useGenerateWithConfirm<T = any>(
  generateFn: () => Promise<T>,
  options: GenerateConfirmOptions,
) {
  const {
    confirmTitle = '确认生成',
    confirmContent,
    confirmIcon,
    okText = '确定',
    cancelText = '取消',
    loadingTitle,
    loadingContent,
    successTitle = '生成成功',
    successContent = '操作完成！',
    errorTitle = '生成失败',
    errorContent,
    onSuccess,
    onError,
  } = options;

  const handleGenerate = () => {
    Modal.confirm({
      centered: true,
      title: confirmTitle,
      content: confirmContent,
      icon: confirmIcon,
      okText,
      cancelText,
      onOk: async () => {
        // 等待确认对话框关闭后再显示 loading
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 显示全局 loading 弹窗
        const hide = Modal.info({
          centered: true,
          title: loadingTitle,
          content: React.createElement(
            'div',
            { style: { textAlign: 'center', padding: '20px 0' } },
            React.createElement(Spin, { size: 'large' }),
            React.createElement(
              'div',
              { style: { color: '#666', marginTop: 16 } },
              loadingContent,
            ),
          ),
          okButtonProps: { style: { display: 'none' } },
          closable: false,
          maskClosable: false,
          width: 400,
        });

        try {
          const result = await generateFn();
          hide.destroy();
          Modal.success({
            centered: true,
            title: successTitle,
            content: successContent,
            onOk: () => {
              onSuccess?.();
            },
          });
          return result;
        } catch (error: any) {
          hide.destroy();
          const errorMsg =
            typeof errorContent === 'function'
              ? errorContent(error)
              : errorContent || error?.message || '操作失败，请稍后重试';
          Modal.error({
            centered: true,
            title: errorTitle,
            content: errorMsg,
          });
          onError?.(error);
          throw error;
        }
      },
    });
  };

  return handleGenerate;
}

/**
 * 通用的生成题目/练习的确认和 Loading 工具函数（非 Hook 版本）
 * 用于在 render 函数或其他不能使用 hook 的场景
 * 
 * @param generateFn 执行生成操作的异步函数
 * @param options 配置选项
 * @returns 返回一个函数，调用时会先显示确认对话框，确认后执行生成操作
 */
export function generateWithConfirm<T = any>(
  generateFn: () => Promise<T>,
  options: GenerateConfirmOptions,
) {
  const {
    confirmTitle = '确认生成',
    confirmContent,
    confirmIcon,
    okText = '确定',
    cancelText = '取消',
    loadingTitle,
    loadingContent,
    successTitle = '生成成功',
    successContent = '操作完成！',
    errorTitle = '生成失败',
    errorContent,
    onSuccess,
    onError,
  } = options;

  Modal.confirm({
    centered: true,
    title: confirmTitle,
    content: confirmContent,
    icon: confirmIcon,
    okText,
    cancelText,
    onOk: async () => {
      // 等待确认对话框关闭后再显示 loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 显示全局 loading 弹窗
      const hide = Modal.info({
        centered: true,
        title: loadingTitle,
        content: React.createElement(
          'div',
          { style: { textAlign: 'center', padding: '20px 0' } },
          React.createElement(Spin, { size: 'large' }),
          React.createElement(
            'div',
            { style: { color: '#666', marginTop: 16 } },
            loadingContent,
          ),
        ),
        okButtonProps: { style: { display: 'none' } },
        closable: false,
        maskClosable: false,
        width: 400,
      });

      try {
        const result = await generateFn();
        hide.destroy();
        Modal.success({
          centered: true,
          title: successTitle,
          content: successContent,
          onOk: () => {
            onSuccess?.();
          },
        });
        return result;
      } catch (error: any) {
        hide.destroy();
        const errorMsg =
          typeof errorContent === 'function'
            ? errorContent(error)
            : errorContent || error?.message || '操作失败，请稍后重试';
        Modal.error({
          centered: true,
          title: errorTitle,
          content: errorMsg,
        });
        onError?.(error);
        throw error;
      }
    },
  });
}

