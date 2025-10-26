import { useQueryClient } from '@tanstack/react-query';
import { usePaginated } from '@/hooks/use-paginated';
import { PaginatedData } from '@/types/pagination';
import { getComments } from '../../queries/get-comments';
import { CommentWithMetadata } from '../../types';

/**
 * A custom hook to fetch and manage paginated comments with infinite scrolling for a specific ticket.
 * This hook simplifies the process of fetching comments in a paginated manner,
 * handling state management, and providing functions to interact with the comment list.
 *
 * @param ticketId - The ID of the ticket for which to fetch comments.
 * @param paginatedComments - The initial paginated data for comments.
 * @returns An object containing the list of comments, pagination state, and functions to handle comment creation and deletion.
 */
export const usePaginatedComments = (
  ticketId: string,
  paginatedComments: PaginatedData<CommentWithMetadata>,
) => {
  // The query key for caching and invalidating the comments query.
  const queryKey = ['comments', ticketId] as const;

  // Shared pagination via reusable hook
  const {
    items: comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePaginated<CommentWithMetadata>({
    queryKey: Array.from(queryKey),
    queryFn: (pageParam) => getComments(ticketId, pageParam),
    initialPage: paginatedComments,
  });

  const queryClient = useQueryClient();

  return {
    comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    /**
     * Invalidates the comments query to refetch the comments when a new comment is created.
     */
    onCreateComment: () =>
      queryClient.invalidateQueries({ queryKey: Array.from(queryKey) }),
    /**
     * Invalidates the comments query to refetch the comments when a comment is deleted.
     */
    onDeleteComment: () =>
      queryClient.invalidateQueries({ queryKey: Array.from(queryKey) }),
  };
};
