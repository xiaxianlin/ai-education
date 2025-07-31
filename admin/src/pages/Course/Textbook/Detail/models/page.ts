import { message, Modal } from 'antd';
import { useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';
import { TextbookApi } from '@/services/textbook';
import { useTextbookForm } from '@/hooks';
import { useParams } from '@umijs/max';

const useContainer = () => {
  const { id } = useParams();

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
    },
  });

  const formProps = useTextbookForm({ onSubmit: refresh });

  const handleDelete = (textbook?: Textbook) => {
    if (!textbook) return;
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除该教材吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => deleteTextbook(textbook.id),
    });
  };

  return {
    id: Number(id),
    loading,
    textbook,
    formProps,
    handleDelete,
  };
};

export const TextbookDetailModel = createContainer(useContainer);
export const useTextbookDetailModel = TextbookDetailModel.useContainer;
