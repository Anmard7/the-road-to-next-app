import { EventSchemas, Inngest } from 'inngest';
import { InvitationCreateEventArgs } from '@/features/invitations/events/event-invitation-created';
import { PasswordResetEventArgs } from '@/features/password/events/event-password-reset';

type SignUpEventArgs = { data: { userId: string } };

type Events = {
  'app/password.password-reset': PasswordResetEventArgs;
  'app/auth.sign-up': SignUpEventArgs;
  'app/invitation.created': InvitationCreateEventArgs;
};

export const inngest = new Inngest({
  id: 'ticket-bounty',
  schemas: new EventSchemas().fromRecord<Events>(),
});
