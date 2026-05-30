import { Button, EmptyState, Modal, PageShell, Spinner } from '@/components/ui';
import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react';
import { usePracticeDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { Progress } from './Progress';
import { QuestionList } from './QuestionList';
import { Report } from './Report';

const resultIconClass = {
  waiting: 'text-muted-foreground',
  generating: 'text-primary',
  success: 'text-emerald-500',
  error: 'text-destructive',
};

function getStemText(question?: Question) {
  const stem = question?.content?.stem || '';
  return typeof stem === 'string' ? stem : String(stem || '');
}

export default function MainView() {
  const {
    navigate,
    loading,
    error,
    session,
    selectedQuestion,
    handleCloseQuestion,
    ungeneratedQuestions,
    hasUngeneratedQuestions,
    isModalOpen,
    setIsModalOpen,
    generationResults,
    handleOpenGenerationModal,
    handleStartGeneration,
    isGenerating,
    handleResetPractice,
  } = usePracticeDetailModel();

  if (loading) {
    return (
      <PageShell
        title="练习详情"
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            返回
          </Button>
        }
      >
        <Spinner />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell
        title="练习详情"
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            返回
          </Button>
        }
      >
        <EmptyState title="加载失败" description={error?.message || '请检查网络连接或稍后重试'} />
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell
        title="练习详情"
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            返回
          </Button>
        }
      >
        <EmptyState title="练习详情不存在" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="练习详情"
      actions={
        <Button variant="outline" onClick={() => navigate(-1)}>
          返回
        </Button>
      }
    >
      <BasicInfo />
      <Progress />
      <Report />
      <QuestionList />

      <Modal open={!!selectedQuestion} title="题目预览" onClose={handleCloseQuestion}>
        {selectedQuestion ? (
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">题型</div>
              <div className="mt-1 text-foreground">{selectedQuestion.question_type_code}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">题干</div>
              <div className="mt-1 whitespace-pre-wrap text-foreground">{getStemText(selectedQuestion) || '-'}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">解析</div>
              <div className="mt-1 text-foreground">{selectedQuestion.explanation || '-'}</div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={isModalOpen}
        title="生成素材"
        onClose={() => {
          if (!isGenerating) {
            setIsModalOpen(false);
          }
        }}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isGenerating}>
              关闭
            </Button>
            <Button onClick={handleStartGeneration} loading={isGenerating}>
              开始生成
            </Button>
          </>
        }
      >
        <div className="divide-y divide-border rounded-md border border-border">
          {ungeneratedQuestions.map((item) => {
            const status = generationResults[item.id] || 'waiting';
            const statusText =
              status === 'generating' ? '生成中...' : status === 'success' ? '成功' : status === 'error' ? '失败' : '等待中';
            const Icon = status === 'generating' ? Loader2 : status === 'success' ? CheckCircle : status === 'error' ? XCircle : Circle;

            return (
              <div key={item.id} className="flex items-center justify-between gap-4 p-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{item.id}</div>
                  <div className="mt-1 truncate text-muted-foreground">{getStemText(item)}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <Icon className={`size-4 ${resultIconClass[status]} ${status === 'generating' ? 'animate-spin' : ''}`} />
                  {statusText}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <div className="sticky bottom-0 -mx-4 flex justify-center gap-3 border-t border-border bg-background/95 p-4 backdrop-blur md:-mx-6">
        <Button disabled={!hasUngeneratedQuestions || isGenerating} loading={isGenerating} onClick={handleOpenGenerationModal}>
          {hasUngeneratedQuestions ? '生成素材' : '素材已全部生成'}
        </Button>
        <Button variant="destructive" onClick={handleResetPractice}>
          重置练习
        </Button>
      </div>
    </PageShell>
  );
}
