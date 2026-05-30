import { PageHeader, UploadButton } from '@/components';
import { Button, PageShell, Spinner } from '@/components/ui';
import { Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTeacherBookDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';

export default function MainView() {
  const { loading, uploading, teacherBook, upload, handleDelete } = useTeacherBookDetailModel();

  const spinTip = useMemo(() => {
    if (uploading) {
      return '上传中...';
    }
    return undefined;
  }, [uploading]);

  return (
    <PageShell
      title={<PageHeader title="教师用书详情" />}
      description={loading ? '加载中...' : '查看教师用书文件和索引信息。'}
      actions={
        <>
          <UploadButton variant="outline" disabled={!teacherBook || uploading} loading={uploading} action={upload}>
            上传
          </UploadButton>
          <Button variant="destructive" icon={<Trash2 className="size-4" />} onClick={handleDelete}>
            删除
          </Button>
        </>
      }
    >
      {loading ? <Spinner /> : <BasicInfo />}
      {uploading && spinTip ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="rounded-lg border border-border bg-card px-5 py-4 text-sm text-card-foreground shadow-xl">
            {spinTip}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
