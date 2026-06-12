import React from 'react';
import { useNavigate } from 'react-router-dom';

const NoFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <section className="w-full max-w-md rounded-lg border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-md border bg-muted text-2xl font-semibold text-muted-foreground">
          404
        </div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">页面走丢了</h1>
        <p className="mt-3 text-sm text-muted-foreground">当前访问的页面不存在，返回工作台继续操作。</p>
        <div className="mt-8">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            onClick={() => navigate('/home')}
          >
          回到首页
          </button>
        </div>
      </section>
    </main>
  );
};

export default NoFoundPage;
