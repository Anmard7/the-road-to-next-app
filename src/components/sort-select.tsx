'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SortSelectOption = {
  label: string;
  sortKey: string;
  sortValue: string;
};
type SortObject = {
  sortKey: string;
  sortValue: string;
};
type SortSelectProps = {
  options: SortSelectOption[];
  value: SortObject;
  onChange: (value: SortObject) => void;
};

export const SortSelect = ({ options, value, onChange }: SortSelectProps) => {
  const handleSort = (compositeKey: string) => {
    const [sortKey, sortValue] = compositeKey.split('_');
    onChange({ sortKey, sortValue });
  };

  return (
    <Select defaultValue={`${value.sortKey}_${value.sortValue}`} onValueChange={handleSort}>
      <SelectTrigger>
        <SelectValue placeholder='Sort by' />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.sortKey + option.sortValue}
            value={option.sortKey + '_' + option.sortValue}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
