import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'teal';
}

const variantStyles = {
  blue: {
    card: 'stat-card-blue',
    text: 'text-stat-blue-text',
    icon: 'bg-stat-blue-text/10',
  },
  green: {
    card: 'stat-card-green',
    text: 'text-stat-green-text',
    icon: 'bg-stat-green-text/10',
  },
  orange: {
    card: 'stat-card-orange',
    text: 'text-stat-orange-text',
    icon: 'bg-stat-orange-text/10',
  },
  pink: {
    card: 'stat-card-pink',
    text: 'text-stat-pink-text',
    icon: 'bg-stat-pink-text/10',
  },
  purple: {
    card: 'stat-card-purple',
    text: 'text-stat-purple-text',
    icon: 'bg-stat-purple-text/10',
  },
  teal: {
    card: 'stat-card-teal',
    text: 'text-stat-teal-text',
    icon: 'bg-stat-teal-text/10',
  },
};

export function StatCard({ title, value, icon: Icon, variant }: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn('stat-card', styles.card)}>
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', styles.icon)}>
          <Icon className={cn('w-6 h-6', styles.text)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className={cn('text-2xl font-bold', styles.text)}>{value}</p>
        </div>
      </div>
    </div>
  );
}
