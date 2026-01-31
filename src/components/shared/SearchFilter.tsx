import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ReactNode } from 'react';

interface SearchFilterProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  count?: number;
  title?: string;
  action?: ReactNode;
}

export function SearchFilter({ 
  placeholder = "Search...", 
  value, 
  onChange,
  count,
  title,
  action
}: SearchFilterProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">
            {title} {count !== undefined && (
              <span className="text-muted-foreground font-normal">({count})</span>
            )}
          </h1>
        )}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 h-10 bg-background border-border"
          />
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
