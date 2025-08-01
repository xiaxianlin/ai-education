import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import React from 'react';
import { useTextbookDetailModel } from '../models/page';
import { Switch, Tag } from 'antd';

export const BasicInfo = () => {
  const { textbook, updateStatus } = useTextbookDetailModel();
  return (
    <ProCard>
      <ProDescriptions column={3} title="基本信息">
        <ProDescriptions.Item label="科目">{textbook?.subject}</ProDescriptions.Item>
        <ProDescriptions.Item label="版本">{textbook?.version}</ProDescriptions.Item>
        <ProDescriptions.Item label="阶段">{textbook?.stage}</ProDescriptions.Item>
        <ProDescriptions.Item label="年级">{textbook?.grade}</ProDescriptions.Item>
        <ProDescriptions.Item label="学期">{textbook?.semester}</ProDescriptions.Item>
        <ProDescriptions.Item label="文件">{textbook?.file}</ProDescriptions.Item>
        <ProDescriptions.Item label="单元解析">
          {textbook?.is_parsed ? <Tag color="success">已解析</Tag> : <Tag>未解析</Tag>}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="状态">
          <Switch
            checked={!!textbook?.status}
            checkedChildren="启用"
            unCheckedChildren="停用"
            onChange={updateStatus}
          />
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
