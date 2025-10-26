'use server';

import { inngest } from '@/lib/inngest';

export const triggerOrphanedFilesCleanup = async () => {
  try {
    await inngest.send({
      name: 'app/cleanup.orphaned-files',
      data: {},
    });
    return {
      success: true,
      message: 'Orphaned files cleanup triggered successfully',
    };
  } catch (error) {
    console.error('Failed to trigger cleanup:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
