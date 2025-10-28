import { Button } from 'antd';
import React from 'react';
import { useTextbookDetailModel } from '../models/page';
import { useNavigate } from '@umijs/max';
import { UploadButton } from '@/components/util';

export const Footer = () => {
  const navigate = useNavigate();
  const { textbook, formProps, upload, handleParse, handleDelete } = useTextbookDetailModel();
  return (
    <div className="grow flex justify-center items-center py-3 gap-3">
      <Button type="primary" onClick={() => formProps.showForm(textbook)}>
        编辑
      </Button>
      <Button type="primary" disabled={!textbook?.file} onClick={handleParse}>
        解析
      </Button>
      <UploadButton type="primary" disabled={!textbook} action={upload}>
        上传
      </UploadButton>
      <Button danger onClick={handleDelete}>
        删除
      </Button>
      <Button onClick={() => navigate(-1)}>返回</Button>
    </div>
  );
};
