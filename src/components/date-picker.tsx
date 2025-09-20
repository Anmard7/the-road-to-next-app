'use client';

import { format } from 'date-fns';
import { LucideChevronDown } from 'lucide-react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type ImperativeHandleFormDatePicker = {
  reset: () => void;
};

type DatePickerProps = {
  name: string;
  id: string;
  defaultValue?: string | undefined;
};

export const DatePicker = forwardRef<
  ImperativeHandleFormDatePicker,
  DatePickerProps
>(({ name, id, defaultValue }: DatePickerProps, ref) => {
  const [open, setOpen] = useState(false);

  // Parse a yyyy-MM-dd string as a local date to avoid timezone shifts.
  const parseLocalDate = (value?: string) => {
    if (!value) return undefined;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!m) return undefined;
    const [, y, mo, d] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d));
  };
  const initialDate = parseLocalDate(defaultValue) ?? new Date();
  const [date, setDate] = useState<Date | undefined>(initialDate);
  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        setDate(parseLocalDate(defaultValue) ?? undefined);
      },
    }),
    [defaultValue],
  );
  const handleSelect = (selecteddate: Date | undefined) => {
    setDate(selecteddate);
    setOpen(false);
  };
  const displayDate = date ? format(date, 'yyyy-MM-dd') : 'Select date';
  const hiddenValue = date ? format(date, 'yyyy-MM-dd') : '';

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
            {displayDate}
            <input type='hidden' name={name} id={id} value={hiddenValue} />
            <LucideChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='single'
            selected={date}
            captionLayout='dropdown'
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
});

DatePicker.displayName = 'DatePicker';
