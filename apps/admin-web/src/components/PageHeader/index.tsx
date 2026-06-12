import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}

export function PageHeader({ title, onBack }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" icon={<ArrowLeft className="size-4" />} onClick={handleBack} />
      <span className="font-semibold">{title}</span>
    </div>
  );
}
