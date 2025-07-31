import { Button } from 'antd';
import React from 'react';
import { useTextbookDetailModel } from '../models/page';

export const Footer = () => {
  const { textbook, formProps, handleDelete } = useTextbookDetailModel();
  return (
    <div className="grow flex justify-center items-center py-2 gap-2">
      <Button type="primary" onClick={() => formProps.showForm(textbook)}>
        编辑
      </Button>
      <Button type="primary" onClick={() => formProps.showForm(textbook)}>
        解析
      </Button>
      <Button danger onClick={() => handleDelete(textbook)}>
        删除
      </Button>
    </div>
  );
};
