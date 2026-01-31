import { Search, Calendar, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  dateFilter?: Date;
  onDateChange?: (date: Date | undefined) => void;
  showDateFilter?: boolean;
  children?: React.ReactNode;
}

export const SearchFilter = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  dateFilter,
  onDateChange,
  showDateFilter = false,
  children,
}: SearchFilterProps) => {
  const hasActiveFilters = searchQuery || dateFilter;

  const clearFilters = () => {
    onSearchChange('');
    onDateChange?.(undefined);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {showDateFilter && onDateChange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              {dateFilter ? format(dateFilter, 'MMM dd, yyyy') : 'Filter by Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={dateFilter}
              onSelect={onDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}

      {children}

      {hasActiveFilters && (
        <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
