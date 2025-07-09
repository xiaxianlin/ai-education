import { api } from '@/utils/api';
import { useBoolean, useRequest } from 'ahooks';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
const useContainer = () => {
  const [page, setPage] = useState(1);
  const [visible, { setTrue, setFalse }] = useBoolean(false);

  const {
    run: search,
    data: listRes,
    loading: listLoading,
  } = useRequest(
    (page: number) => {
      return api.get<ListResult<Question>>('/education/questions', {
        page_num: page,
        page_size: 10,
      });
    },
    {
      manual: true,
      onError: () => {
        message.error('题库获取失败');
      },
    },
  );

  const {
    mutate,
    run: getDetail,
    data: deitalRes,
    loading: detailLoading,
  } = useRequest((id: string) => api.get<Question>(`/education/question/${id}`), {
    manual: true,
    onError: () => {
      message.error('详情获取失败');
    },
  });

  const showDetail = (id: string) => {
    setTrue();
    getDetail(id);
  };

  const hideDetail = () => {
    setFalse();
    mutate(undefined);
  };

  useEffect(() => {
    search(page);
  }, [page]);

  return {
    state: {
      page,
      visible,
      listLoading,
      detailLoading,
      question: deitalRes?.data,
      total: listRes?.data?.total || 0,
      questions: listRes?.data?.data || [],
    },
    setPage,
    showDetail,
    hideDetail,
  };
};

export const QuestionListModel = createContainer(useContainer);
export const useQuestionListModel = QuestionListModel.useContainer;
