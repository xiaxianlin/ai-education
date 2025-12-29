import { StatusTag } from '@/components';
import { GRADES } from '@ai-education/shared-web';
import { ProDescriptions } from '@ant-design/pro-components';
import { Flex } from 'antd';
import { BasicInfoForm } from '../components/BasicInfoForm';
import { useStudentDetailModel } from '../models/page';
import { Footer } from './Footer';
export function BasicInfo() {
  const { student } = useStudentDetailModel();

  return (
    <Flex vertical gap={16} className='relative'>
      <Footer />
      <ProDescriptions column={1}>
        <ProDescriptions.Item label="姓名">{(student as any)?.name || ''}</ProDescriptions.Item>
        <ProDescriptions.Item label="手机号">{(student as any)?.phone || ''}</ProDescriptions.Item>
        <ProDescriptions.Item label="年级">
          {(student as any)?.grade !== undefined ? GRADES[(student as any).grade] : ''}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="状态">
          <StatusTag status={(student as any)?.status === 1} />
        </ProDescriptions.Item>
        <ProDescriptions.Item label="创建时间" valueType="dateTime">
          {(student as any)?.create_time ? (student as any).create_time * 1000 : ''}
        </ProDescriptions.Item>
        {(student as any)?.update_time && (
          <ProDescriptions.Item label="更新时间" valueType="dateTime">
            {(student as any).update_time * 1000}
          </ProDescriptions.Item>
        )}
      </ProDescriptions>
      <BasicInfoForm />
    </Flex>
  );
}
