import { EventSchemas, Inngest } from 'inngest';
import { AttachmentDeleteEventArgs } from '@/features/attachment/events/event-attachment-deleted';
import { InvitationCreateEventArgs } from '@/features/invitations/events/event-invitation-created';
import { OrganisationDeleteEventArgs } from '@/features/organisation/events/event-organisation-deleted';
import { PasswordResetEventArgs } from '@/features/password/events/event-password-reset';
import { TicketDeleteEventArgs } from '@/features/ticket/events/event-ticket-deleted';

type SignUpEventArgs = { data: { userId: string } };

type Events = {
  'app/password.password-reset': PasswordResetEventArgs;
  'app/auth.sign-up': SignUpEventArgs;
  'app/invitation.created': InvitationCreateEventArgs;
  'app/attachment.deleted': AttachmentDeleteEventArgs;
  'app/organisation.deleted': OrganisationDeleteEventArgs;
  'app/ticket.deleted': TicketDeleteEventArgs;
  'app/cleanup.orphaned-files': { data: Record<string, never> };
};

export const inngest = new Inngest({
  id: 'ticket-bounty',
  schemas: new EventSchemas().fromRecord<Events>(),
});
