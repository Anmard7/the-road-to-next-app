'use client';
import { useQueryStates } from 'nuqs';
import { SortSelect, SortSelectOption } from '@/components/sort-select';
import { sortOptions, sortParser } from '../serach-params';

type TicketSortSelectProps = {
  options: SortSelectOption[];
};

export const TicketSortSelect = ({ options }: TicketSortSelectProps) => {
  const [sort, setSort] = useQueryStates(sortParser, sortOptions);
  return <SortSelect options={options} value={sort} onChange={setSort} />;
};
