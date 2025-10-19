'use server';

import { revalidatePath } from 'next/cache';
import { organisationsPath } from '@/paths';

export const revalidateOrganizations = async () => {
  revalidatePath(organisationsPath());
};
