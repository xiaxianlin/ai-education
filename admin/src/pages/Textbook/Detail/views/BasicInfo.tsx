import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import React from 'react';
import { useTextbookDetailModel } from '../models/page';
import { Tag } from 'antd';
import { StatusTag } from '@/components/ui';
import { GRADES } from '@/constants/course';

export const BasicInfo = () => {
  const { textbook } = useTextbookDetailModel();
  const info = textbook?.grade ? GRADES[textbook.grade] : undefined;
  return (
    <ProCard>
      <ProDescriptions column={4} title="基本信息">
        <ProDescriptions.Item label="科目">{textbook?.subject}</ProDescriptions.Item>
        <ProDescriptions.Item label="版本">{textbook?.version}</ProDescriptions.Item>
        <ProDescriptions.Item label="阶段">{info?.stage}</ProDescriptions.Item>
        <ProDescriptions.Item label="年级">{info?.grade}</ProDescriptions.Item>
        <ProDescriptions.Item label="学期">{textbook?.semester}</ProDescriptions.Item>
        <ProDescriptions.Item label="文件">{textbook?.file}</ProDescriptions.Item>
        <ProDescriptions.Item label="单元解析">
          <StatusTag status={!!textbook?.is_parsed} trueText="已解析" falseText="未解析" />
        </ProDescriptions.Item>
        <ProDescriptions.Item label="状态">
          <StatusTag status={textbook?.status === 1} />
        </ProDescriptions.Item>
        <ProDescriptions.Item label="创建时间" valueType="dateTime">
          {(textbook?.create_time || 0) * 1000}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="更新时间" valueType="dateTime">
          {(textbook?.update_time || 0) * 1000}
        </ProDescriptions.Item>
      </ProDescriptions>
    </ProCard>
  );
};
