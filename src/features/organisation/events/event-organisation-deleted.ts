import { deleteS3ObjectsByPrefix } from '@/features/attachment/utils/delete-s3-objects';
import { inngest } from '@/lib/inngest';

export type OrganisationDeleteEventArgs = {
  data: {
    organisationId: string;
    attachments: Array<{
      id: string;
      name: string;
    }>;
  };
};

export const eventOrganisationDeleted = inngest.createFunction(
  { id: 'organisation-deleted' },
  { event: 'app/organisation.deleted' },
  async ({ event }) => {
    const { organisationId, attachments } = event.data;

    console.log(`🧹 Starting S3 cleanup for organization: ${organisationId}`);
    console.log(`📎 Found ${attachments.length} attachments to clean up`);

    // Delete all S3 objects with the organization prefix
    const result = await deleteS3ObjectsByPrefix(`${organisationId}/`);

    console.log(`✅ S3 cleanup completed for organization: ${organisationId}`);
    console.log(`   - Successfully deleted: ${result.successful} files`);
    console.log(`   - Failed to delete: ${result.failed} files`);

    if (result.errors.length > 0) {
      console.error(`❌ S3 cleanup errors for organization: ${organisationId}`);
      result.errors.forEach((error) => console.error(`   - ${error}`));
    }

    return {
      event,
      body: {
        organisationId,
        attachmentsProcessed: attachments.length,
        s3CleanupResult: result,
      },
    };
  },
);
