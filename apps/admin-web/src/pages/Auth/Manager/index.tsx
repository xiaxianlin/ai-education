import React, { useRef } from 'react';
import type { TableActionRef } from '@/components/ui';
import { ManagerFormView } from './views/FormView';
import { ManagerTableView } from './views/TableView';

export default function ManagerPage() {
  const actionRef = useRef<TableActionRef>();
  const [formVisible, setFormVisible] = React.useState(false);

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">老师管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">维护老师账号、状态与初始密码。</p>
      </header>
      <ManagerTableView actionRef={actionRef} onAddClick={() => setFormVisible(true)} />
      <ManagerFormView open={formVisible} onOpenChange={setFormVisible} actionRef={actionRef} />
    </main>
  );
}
