import { getAuth } from '@/features/auth/queries/get-auth';
import { isOwner } from '@/features/auth/utils/is-owner';
import { getActiveOrganisation } from '@/features/organisation/queries/get-active-organisation';
import { getOrganisationsByUserId } from '@/features/organisation/queries/get-organisations-by-user';
import { ParsedSearchParams } from '@/features/ticket/serach-params';
import { prisma } from '@/lib/prisma';

export const getTickets = async (
  userId: string | undefined,
  byOrganisation: boolean,
  searchParams: ParsedSearchParams,
) => {
  const { user } = await getAuth();
  const activeOrganisation = await getActiveOrganisation();
  const myTicketsFilter = searchParams.myTicketsFilter;

  const where = {
    userId,
    title: {
      contains: searchParams.search,
      mode: 'insensitive' as const,
    },
    ...(byOrganisation && activeOrganisation
      ? { organisationId: activeOrganisation.id }
      : {}),
    ...(myTicketsFilter && activeOrganisation
      ? {
          organisationId: activeOrganisation.id,
        }
      : {}),
  };
  const skip = searchParams.page * searchParams.size;
  const take = searchParams.size;

  // we are using a transaction to ensure an error is thrown if one of the database queries fails
  const [tickets, count] = await prisma.$transaction([
    prisma.ticket.findMany({
      where,
      skip,
      take,
      orderBy: {
        [searchParams.sortKey]: searchParams.sortValue,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    }),
    prisma.ticket.count({
      where,
    }),
  ]);
  const organisationsByUser = await getOrganisationsByUserId();
  return {
    list: tickets.map((ticket) => {
      const organisation = organisationsByUser.find(
        (organisation) => organisation.id === ticket.organisationId,
      );

      return {
        ...ticket,
        isOwner: isOwner(user, ticket),
        permissions: {
          canDeleteTicket:
            isOwner(user, ticket) &&
            !!organisation?.membershipByUser.canDeleteTicket,
          canUpdateTicket:
            isOwner(user, ticket) &&
            !!organisation?.membershipByUser.canUpdateTicket,
        },
      };
    }),
    metadata: { count, hasNextPage: count > skip + take },
  };
};
