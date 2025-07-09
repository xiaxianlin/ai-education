import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useQuestionResolveModel } from '../../models/page';

export default function UploadView() {
  const { processing, handleSelectFile } = useQuestionResolveModel();
  return (
    <Upload disabled={processing} accept="image/*" showUploadList={false} beforeUpload={handleSelectFile}>
      <Button type="primary" disabled={processing} icon={<UploadOutlined />}>
        上传问题
      </Button>
    </Upload>
  );
}
