'use server';

import { revalidatePath } from 'next/cache';
import { membershipsPath } from '@/paths';

export const revalidateMemberships = async (organisationId: string) => {
  revalidatePath(membershipsPath(organisationId));
};
