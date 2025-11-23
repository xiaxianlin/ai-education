import { message, Modal, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';
import { TextbookApi } from '@/services/textbook';
import { useNavigate, useParams } from '@umijs/max';
import { useState } from 'react';
import React from 'react';

const useContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const {
    data: textbook,
    loading,
    refresh,
  } = useRequest(() => TextbookApi.get(Number(id)), {
    ready: !!id,
  });

  const { runAsync: deleteTextbook } = useRequest(TextbookApi.delete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      navigate('/course/textbook');
    },
  });
  const { loading: parsing, runAsync: parse } = useRequest(TextbookApi.parse, {
    manual: true,
    onSuccess: () => {
      message.success('解析完成');
      refresh();
    },
  });


  const { loading: uploading, run: upload } = useRequest(
    (data) => TextbookApi.upload(textbook!.id, data),
    {
      manual: true,
      onSuccess: () => {
        message.success('上传成功');
        refresh();
      },
    },
  );

  const handleDelete = () => {
    if (!textbook) return;
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除该教材吗？`,
      okType: 'danger',
      onOk: () => {
        deleteTextbook(textbook.id);
      },
    });
  };


  const handleParse = () => {
    if (!textbook) return;
    Modal.confirm({
      centered: true,
      title: '解析教材',
      content: textbook.is_parsed
        ? `当前教材已经被解析过，再次解析会覆盖当前所有内容，确定要解析吗？`
        : `确定要解析当前教材吗？`,
      onOk: () => {
        parse(textbook.id);
      },
    });
  };

  const handleGenerateQuestions = () => {
    if (!textbook) return;
    Modal.confirm({
      centered: true,
      title: '生成题目',
      content: '确定要为该教材生成题目吗？生成过程可能需要一些时间，请耐心等待。',
      onOk: async () => {
        // 显示全局 loading 弹窗
        const hide = Modal.info({
          centered: true,
          title: '正在生成题目',
          content: React.createElement(
            'div',
            { style: { textAlign: 'center', padding: '20px 0' } },
            React.createElement(Spin, { size: 'large' }),
            React.createElement(
              'div',
              { style: { color: '#666', marginTop: 16 } },
              '题目生成中，请稍候...',
            ),
          ),
          okButtonProps: { style: { display: 'none' } },
          closable: false,
          maskClosable: false,
          width: 400,
        });

        try {
          await TextbookApi.generateQuestions(textbook.id);
          hide.destroy();
          Modal.success({
            centered: true,
            title: '生成成功',
            content: '题目生成完成！',
            onOk: () => {
              refresh();
            },
          });
        } catch (error: any) {
          hide.destroy();
          Modal.error({
            centered: true,
            title: '生成失败',
            content: error?.message || '题目生成失败，请稍后重试',
          });
        }
      },
    });
  };

  return {
    id: Number(id),
    units,
    loading,
    parsing,
    textbook,
    uploading,
    upload,
    setUnits,
    handleParse,
    handleDelete,
    handleGenerateQuestions,
  };
};

export const TextbookDetailModel = createContainer(useContainer);
export const useTextbookDetailModel = TextbookDetailModel.useContainer;
