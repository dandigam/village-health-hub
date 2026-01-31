import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchFilterProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  count?: number;
  title?: string;
}

export function SearchFilter({ 
  placeholder = "Search...", 
  value, 
  onChange,
  count,
  title
}: SearchFilterProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {title && (
        <h1 className="text-xl font-semibold text-foreground">
          {title} {count !== undefined && (
            <span className="text-muted-foreground font-normal">({count})</span>
          )}
        </h1>
      )}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-10 bg-background border-border"
        />
      </div>
    </div>
  );
}
