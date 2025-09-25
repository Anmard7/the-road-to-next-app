'use client';
import { useQueryState } from 'nuqs';
import { SearchInput } from '@/components/search-input';
import { searchParser } from '../serach-params';

type TicketSearchProps = {
  placeholder: string;
};
export const TicketSearchInput = ({ placeholder }: TicketSearchProps) => {
  const [search, setSearch] = useQueryState('search', searchParser);

  return (
    <SearchInput
      value={search}
      onChange={setSearch}
      placeholder={placeholder}
    />
  );
};
