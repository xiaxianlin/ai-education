import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export function BackToHomeButton() {
  return (
    <Link to="/home">
      <Button variant="ghost" size="sm" className="gap-2">
        <Home className="h-4 w-4" />
        返回首页
      </Button>
    </Link>
  );
}
