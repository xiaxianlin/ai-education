/**
 * 筛选标签组件
 */
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterType = 'all' | 'unmastered' | 'mastered';

interface FilterTabsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const FilterTabs = memo(function FilterTabs({
  filter,
  onFilterChange,
}: FilterTabsProps) {
  const filters: Array<{ value: FilterType; label: string }> = [
    { value: 'all', label: '全部' },
    { value: 'unmastered', label: '待练习' },
    { value: 'mastered', label: '已掌握' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-5 w-5 text-gray-500" />
      {filters.map((f) => (
        <Button
          key={f.value}
          variant={filter === f.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(f.value)}
          className={cn(
            'rounded-xl',
            filter === f.value && 'bg-blue-500 hover:bg-blue-600'
          )}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
});

