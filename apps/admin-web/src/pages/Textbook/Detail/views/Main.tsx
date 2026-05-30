import { PageHeader, UploadButton } from '@/components';
import { Button, PageShell, Spinner } from '@/components/ui';
import { FileCode2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTextbookDetailModel } from '../models/page';
import { TextbookUnitModel } from '../models/unit';
import { BasicInfo } from './BasicInfo';
import { UnitView } from './Unit';

export default function MainView() {
  const { loading, parsing, uploading, textbook, upload, handleParse, handleDelete } = useTextbookDetailModel();

  const spinTip = useMemo(() => {
    if (parsing) {
      return '教材解析时间较长，一般在 30s 左右，请耐心等候';
    }
    if (uploading) {
      return '上传中...';
    }
    return undefined;
  }, [parsing, uploading]);

  return (
    <PageShell
      title={<PageHeader title="教材详情" />}
      description={loading ? '加载中...' : '查看教材文件、解析状态和单元内容。'}
      actions={
        <>
          <Button
            icon={<FileCode2 className="size-4" />}
            disabled={!textbook?.file}
            loading={parsing}
            onClick={handleParse}
          >
            解析
          </Button>
          <UploadButton variant="outline" disabled={!textbook || uploading} loading={uploading} action={upload}>
            上传
          </UploadButton>
          <Button variant="destructive" icon={<Trash2 className="size-4" />} onClick={handleDelete}>
            删除
          </Button>
        </>
      }
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          <BasicInfo />
          <TextbookUnitModel.Provider>
            <UnitView />
          </TextbookUnitModel.Provider>
        </>
      )}
      {(parsing || uploading) && spinTip ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="rounded-lg border border-border bg-card px-5 py-4 text-sm text-card-foreground shadow-xl">
            {spinTip}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
