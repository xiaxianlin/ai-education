import { Badge, Button, Card, CardContent } from '@/components/ui';
import { GRADES } from '@ai-education/shared-web';

export function TextbookCard({
  textbook,
  active,
  selected,
  onSelect,
  onDelete,
}: {
  textbook: Textbook;
  active?: boolean;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onDelete?: () => void;
}) {
  const handleDelete = () => {
    if (window.confirm('确定要删除该教材吗？')) {
      onDelete?.();
    }
  };

  return (
    <div className="group relative">
      <Card className="transition-colors hover:border-primary/50">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-semibold text-muted-foreground">
            书
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-foreground">{textbook.subject}</div>
              {active ? <Badge variant="success">当前阶段</Badge> : null}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {textbook.version} | {GRADES[textbook.grade]} | {textbook.semester}
            </div>
          </div>
        </CardContent>
      </Card>
      {onSelect ? (
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelect(event.target.checked)}
          className="absolute left-2 top-2 z-10 h-4 w-4 rounded border-border"
          onClick={(event) => event.stopPropagation()}
        />
      ) : null}
      {onDelete ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="pointer-events-none absolute right-2 top-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
        >
          删除
        </Button>
      ) : null}
    </div>
  );
}
