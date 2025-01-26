'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { buttonVariants } from '@/components/ui/button';

interface CalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date) => void;
}

export function Calendar({ className, selected, onSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(selected || new Date());
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  return (
    <div className={cn('p-3', className)}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className={cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 p-0')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-medium">
          {currentDate.toLocaleDateString('en-US', { 
            month: 'long',
            year: 'numeric'
          })}
        </div>
        <button
          onClick={nextMonth}
          className={cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 p-0')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-muted-foreground p-2">{day}</div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        
        {days.map((day) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isSelected = selected?.toDateString() === date.toDateString();
          
          return (
            <button
              key={day}
              onClick={() => onSelect?.(date)}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'h-9 w-9 p-0 font-normal',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                date.toDateString() === new Date().toDateString() && 'bg-accent text-accent-foreground'
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Calendar.displayName = 'Calendar';
