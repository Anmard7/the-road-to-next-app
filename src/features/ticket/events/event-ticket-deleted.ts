import { deleteS3ObjectsByPrefix } from '@/features/attachment/utils/delete-s3-objects';
import { inngest } from '@/lib/inngest';

export type TicketDeleteEventArgs = {
  data: {
    organisationId: string;
    ticketId: string;
    attachments: Array<{
      id: string;
      name: string;
    }>;
  };
};

export const eventTicketDeleted = inngest.createFunction(
  { id: 'ticket-deleted' },
  { event: 'app/ticket.deleted' },
  async ({ event }) => {
    const { organisationId, ticketId, attachments } = event.data;

    console.log(
      `🧹 Starting S3 cleanup for ticket: ${ticketId} in organization: ${organisationId}`,
    );
    console.log(`📎 Found ${attachments.length} attachments to clean up`);

    // Delete all S3 objects with the ticket prefix
    const result = await deleteS3ObjectsByPrefix(
      `${organisationId}/${ticketId}/`,
    );

    console.log(`✅ S3 cleanup completed for ticket: ${ticketId}`);
    console.log(`   - Successfully deleted: ${result.successful} files`);
    console.log(`   - Failed to delete: ${result.failed} files`);

    if (result.errors.length > 0) {
      console.error(`❌ S3 cleanup errors for ticket: ${ticketId}`);
      result.errors.forEach((error) => console.error(`   - ${error}`));
    }

    return {
      event,
      body: {
        organisationId,
        ticketId,
        attachmentsProcessed: attachments.length,
        s3CleanupResult: result,
      },
    };
  },
);
