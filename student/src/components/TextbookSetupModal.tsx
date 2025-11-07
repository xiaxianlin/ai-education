import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface TextbookSetupModalProps {
  onClose?: () => void;
}

export function TextbookSetupModal({ onClose }: TextbookSetupModalProps) {
  const navigate = useNavigate();

  const handleGoToSettings = () => {
    onClose?.();
    navigate({ to: '/settings' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">请设置学习教材</CardTitle>
              <CardDescription className="mt-1">
                选择你的当前学习教材，以便开始学习
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            你还没有设置当前学习教材，请前往信息设置页面选择一本教材作为当前学习教材。
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              稍后设置
            </Button>
            <Button
              onClick={handleGoToSettings}
              className="flex-1"
            >
              去设置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

