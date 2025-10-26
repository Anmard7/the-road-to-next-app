"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { PaginatedData } from "@/types/pagination";

export type Cursor = { id: string; createdAt: number };

export interface UsePaginatedOptions<TItem> {
  // Stable query key used by React Query
  queryKey: unknown[];
  // Function that fetches a page, optionally using a cursor
  queryFn: (pageParam?: Cursor) => Promise<PaginatedData<TItem>>;
  // Initial page of data rendered server-side
  initialPage: PaginatedData<TItem>;
}

export interface UsePaginatedResult<TItem> {
  items: TItem[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  invalidate: () => Promise<void>;
}

export function usePaginated<TItem>(
  options: UsePaginatedOptions<TItem>
): UsePaginatedResult<TItem> {
  const { queryKey, queryFn, initialPage } = options;
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) => queryFn(pageParam as Cursor | undefined),
      initialPageParam: undefined as Cursor | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.metadata.hasNextPage ? lastPage.metadata.cursor : undefined,
      initialData: {
        pages: [initialPage],
        pageParams: [undefined],
      },
    });

  const items = data.pages.flatMap((page) => page.list);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  return {
    items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidate,
  };
}

