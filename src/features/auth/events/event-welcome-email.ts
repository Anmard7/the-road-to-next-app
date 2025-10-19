import { sendEmailWelcome } from '@/features/auth/emails/send-email-welcome';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { signInPath } from '@/paths';
import { getBaseUrl } from '@/utils/url';
export const eventWelcomeEmail = inngest.createFunction(
  { id: 'email-welcome' },
  // Fan-out: listen to the shared sign-up event so this job
  // runs independently alongside other post-signup jobs.
  { event: 'app/auth.sign-up' },
  async ({ event, step }) => {
    const { userId } = event.data;
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const loginLink = getBaseUrl() + signInPath();

    const emailWelcomeDelay = 5 * 60 * 1000; // 5 minutes

    await step.sleep('wait-five-min-for-welcome-email', emailWelcomeDelay); // 5 minutes

    const result = await step.run('send-welcome-email', async () => {
      return await sendEmailWelcome(user.username, user.email, loginLink);
    });

    if (result.error) {
      throw new Error(`${result.error.name}: ${result.error.message}`);
    }
    return { event, body: result };
  },
);
