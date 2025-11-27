/**
 * 操作按钮组件
 */
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, BookOpen, History } from 'lucide-react';

interface ActionButtonsProps {
  sessionType: PracticeSessionType;
}

export const ActionButtons = memo(function ActionButtons({
  sessionType,
}: ActionButtonsProps) {
  const navigate = useNavigate();

  const getBackPath = () => {
    switch (sessionType) {
      case 'daily_practice':
        return '/home';
      case 'unit_practice':
        return '/unit-practice';
      case 'assessment':
        return '/home';
      default:
        return '/home';
    }
  };

  return (
    <div className="space-y-4">
      {/* 主要操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(getBackPath())}
          className="h-14 rounded-xl text-base"
        >
          <Home className="h-5 w-5 mr-2" />
          返回
        </Button>
        {sessionType === 'daily_practice' && (
          <Button
            variant="outline"
            onClick={() => navigate('/wrong')}
            className="h-14 rounded-xl text-base"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            复习错题
          </Button>
        )}
        <Button
          onClick={() => navigate('/practice-history')}
          className="h-14 rounded-xl text-base bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <History className="h-5 w-5 mr-2" />
          查看历史记录
        </Button>
      </div>

      {/* 推荐操作 */}
      {sessionType === 'daily_practice' && (
        <div className="bg-secondary/10 rounded-2xl p-6 border-2 border-secondary/20">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <p className="font-medium text-foreground">推荐下一步</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/wrong')}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再练错题
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/unit-practice')}
              className="w-full"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              单元练习
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

