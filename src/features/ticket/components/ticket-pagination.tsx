'use client';
import { useQueryState, useQueryStates } from 'nuqs';
import { useEffect, useRef } from 'react';
import { Pagination } from '@/components/pagination';
import {
  paginationOptions,
  paginationParser,
  searchParser,
} from '../serach-params';

type TicketPaginationProps = {
  paginatedTicketMetadata: {
    count: number;
    hasNextPage: boolean;
  };
};

export const TicketPagination = ({
  paginatedTicketMetadata,
}: TicketPaginationProps) => {
  const [pagination, setPagination] = useQueryStates(
    paginationParser,
    paginationOptions,
  );
  const [search] = useQueryState('search', searchParser);

  const prevSearch = useRef(search);

  // set pagination to 0 when search changes
  useEffect(() => {
    if (search === prevSearch.current) return;
    setPagination({ ...pagination, page: 0 });
    prevSearch.current = search;
    // add more reactive effects here to update the pagination
  }, [search, setPagination, pagination]);

  return (
    <Pagination
      pagination={pagination}
      onPageination={setPagination}
      paginatedTicketMetadata={paginatedTicketMetadata}
    />
  );
};
