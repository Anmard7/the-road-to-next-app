import {
  createParser,
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server';

// parse as positive integer to prevent crashing the server
export const parseAsPositiveInteger = createParser({
  parse: (v) => {
    const int = parseInt(v);
    if (Number.isNaN(int)) {
      return null;
    }
    if (int < 0) {
      return null;
    }
    return int;
  },
  serialize: (v) => Math.round(v).toFixed(),
});

export const searchParser = parseAsString.withDefault('').withOptions({
  shallow: false,
  clearOnDefault: true,
});

export const sortParser = {
  sortKey: parseAsString.withDefault('createdAt'),
  sortValue: parseAsString.withDefault('desc'),
};

export const sortOptions = {
  shallow: false,
  clearOnDefault: true,
};
export const paginationParser = {
  page: parseAsPositiveInteger.withDefault(0),
  size: parseAsInteger.withDefault(5),
};

export const paginationOptions = {
  shallow: false,
  clearOnDefault: true,
};
export const editCommentParser = parseAsString.withDefault('').withOptions({
  shallow: true, // client-only updates for inline form (no RSC refetch)
  clearOnDefault: true,
});

export const myTicketsFilterParser = parseAsBoolean
  .withOptions({
    shallow: false,
    clearOnDefault: true,
  })
  .withDefault(false);

export const searchParamsCache = createSearchParamsCache({
  search: searchParser,
  ...sortParser,
  ...paginationParser,
  myTicketsFilter: myTicketsFilterParser,
  editComment: editCommentParser,
});

export type ParsedSearchParams = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
