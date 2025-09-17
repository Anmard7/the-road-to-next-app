'use client';

import { format } from 'date-fns';
import { LucideChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DatePickerProps = {
  name: string;
  id: string;
  defaultValue?: string | undefined;
};

export const DatePicker = ({ name, id, defaultValue }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : new Date(),
  );

  const formattedStringDate = date ? format(date, 'yyyy-MM-dd') : 'Select date';

  return (
    <div className='flex flex-col gap-3'>
      {/* <Label htmlFor='date' className='px-1'>Date</Label> */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className='w-full justify-between font-normal'
          name={name}
          id={id}
          asChild
        >
          <Button
            variant='outline'
            id={id}
            className='justify-between font-normal'
          >
            {formattedStringDate}
            <input
              type='hidden'
              name={name}
              id={id}
              value={formattedStringDate}
            />
            <LucideChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='single'
            selected={date}
            captionLayout='dropdown'
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
