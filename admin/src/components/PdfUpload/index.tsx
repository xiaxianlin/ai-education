import React, { useState } from 'react';
import { Upload, Button, message, Modal } from 'antd';
import { UploadOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

interface PdfUploadProps {
  textbookId: string;
  currentPdf?: string;
  onUploadSuccess?: (pdfUrl: string) => void;
  uploadApi: (id: string, file: File) => Promise<{ pdf: string }>;
}

const PdfUpload: React.FC<PdfUploadProps> = ({
  textbookId,
  currentPdf,
  onUploadSuccess,
  uploadApi,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const beforeUpload = (file: File) => {
    const isPdf = file.type === 'application/pdf';
    if (!isPdf) {
      message.error('只能上传 PDF 文件!');
      return Upload.LIST_IGNORE;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('PDF 文件必须小于 10MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const result = await uploadApi(textbookId, file as File);
      message.success('PDF 上传成功');
      onSuccess?.(result);
      onUploadSuccess?.(result.pdf);
    } catch (error) {
      message.error('PDF 上传失败');
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const showPreview = () => {
    if (currentPdf) {
      setPreviewVisible(true);
    }
  };

  const uploadProps: UploadProps = {
    accept: '.pdf',
    maxCount: 1,
    showUploadList: false,
    beforeUpload,
    customRequest: handleUpload,
  };

  return (
    <>
      <Upload {...uploadProps}>
        <Button
          type="text"
          icon={<UploadOutlined />}
          loading={uploading}
          style={{ padding: 0, height: 'auto' }}
        >
          {currentPdf ? '更新PDF' : '上传PDF'}
        </Button>
      </Upload>
      
      {currentPdf && (
        <Button
          type="text"
          icon={<FilePdfOutlined />}
          onClick={showPreview}
          style={{ padding: 0, height: 'auto', marginLeft: 8 }}
        >
          预览
        </Button>
      )}

      <Modal
        title="PDF预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
        ]}
        width="80%"
        style={{ top: 20 }}
      >
        <iframe
          src={currentPdf}
          style={{ width: '100%', height: '70vh', border: 'none' }}
          title="PDF预览"
        />
      </Modal>
    </>
  );
};

export default PdfUpload;