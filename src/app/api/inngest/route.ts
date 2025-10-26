import { serve } from 'inngest/next';
import { eventAttachmentDeleted } from '@/features/attachment/events/event-attachment-deleted';
import { scheduledCleanupOrphanedFiles, scheduledCleanupOrphanedFilesCron } from '@/features/attachment/events/event-cleanup-orphaned-files';
import { eventEmailVerification } from '@/features/auth/events/event-email-verification';
import { eventWelcomeEmail } from '@/features/auth/events/event-welcome-email';
import { eventHandleInvitationsOnSignUp } from '@/features/invitations/events/event-handle-invitations-on-signup';
import { eventInvitationCreated } from '@/features/invitations/events/event-invitation-created';
import { eventOrganisationDeleted } from '@/features/organisation/events/event-organisation-deleted';
import { eventPasswordReset } from '@/features/password/events/event-password-reset';
import { eventTicketDeleted } from '@/features/ticket/events/event-ticket-deleted';
import { inngest } from '@/lib/inngest';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    eventPasswordReset,
    eventWelcomeEmail,
    eventEmailVerification,
    eventInvitationCreated,
    eventHandleInvitationsOnSignUp,
    eventAttachmentDeleted,
    eventOrganisationDeleted,
    eventTicketDeleted,
    scheduledCleanupOrphanedFiles,
    scheduledCleanupOrphanedFilesCron,
  ],
});
