import { serve } from 'inngest/next';
import { eventEmailVerification } from '@/features/auth/events/event-email-verification';
import { eventWelcomeEmail } from '@/features/auth/events/event-welcome-email';
import { eventPasswordReset } from '@/features/password/events/event-password-reset';
import { inngest } from '@/lib/inngest';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [eventPasswordReset, eventWelcomeEmail, eventEmailVerification],
});
