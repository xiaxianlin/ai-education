import { PageHeader } from '@/components';
import { Button, PageShell, Spinner } from '@/components/ui';
import { Trash2 } from 'lucide-react';
import { useTextbookDetailModel } from '../models/page';
import { TextbookUnitModel } from '../models/unit';
import { BasicInfo } from './BasicInfo';
import { UnitView } from './Unit';

export default function MainView() {
  const { loading, handleDelete } = useTextbookDetailModel();

  return (
    <PageShell
      title={<PageHeader title="教材详情" />}
      description={loading ? '加载中...' : '查看教材基础信息和手工录入的单元内容。'}
      actions={
        <Button variant="destructive" icon={<Trash2 className="size-4" />} onClick={handleDelete}>
          删除
        </Button>
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
    </PageShell>
  );
}
