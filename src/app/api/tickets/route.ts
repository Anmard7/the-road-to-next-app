import { NextRequest } from 'next/server';
import { SearchParams } from 'nuqs/server';
import { getTickets } from '@/features/ticket/queries/get-tickets';
import { searchParamsCache } from '@/features/ticket/serach-params';

export const GET = async (request: NextRequest) => {
  try {
    const rawSearchParams = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    ) as SearchParams;

    // typed search params 
    const searchParams = searchParamsCache.parse(rawSearchParams);

    const { list, metadata } = await getTickets(undefined, false, searchParams);

    return Response.json({ list, metadata });
  } catch (error) {
    console.error('[tickets-api] GET failed', error);
    return new Response(null, { status: 500 });
  }
};

