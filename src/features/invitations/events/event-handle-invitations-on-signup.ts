import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';

// Fan-out job: handle pending invitations after sign-up.
// Listens to the shared 'app/auth.sign-up' event and runs independently
// from other post-signup jobs like email verification and welcome email.
export const eventHandleInvitationsOnSignUp = inngest.createFunction(
  { id: 'invitation-handle-on-signup' },
  { event: 'app/auth.sign-up' },
  async ({ event, step }) => {
    const { userId } = event.data;

    const user = await step.run('load-user', async () => {
      return prisma.user.findUnique({ where: { id: userId } });
    });
    if (!user) {
      return { event, body: { handled: false, reason: 'user-not-found' } };
    }

    const invitations = await step.run(
      'find-pending-invitations-by-email',
      async () => {
        return prisma.invitation.findMany({
          where: {
            email: user.email,
            status: 'ACCEPTED_WITHOUT_ACCOUNT',
          },
        });
      },
    );

    if (!invitations.length) {
      return { event, body: { handled: false, reason: 'no-invitation' } };
    }

    // Create memberships for all pending invitations and delete them.
    // Idempotent: if membership exists, skip creation; always attempt deletion.
    await step.run('finalise-invitations', async () => {
      await prisma.$transaction(async (tx) => {
        for (const invitation of invitations) {
          const existingMembership = await tx.membership.findFirst({
            where: {
              organisationId: invitation.organisationId,
              userId: user.id,
            },
          });

          if (!existingMembership) {
            await tx.membership.create({
              data: {
                organisationId: invitation.organisationId,
                userId: user.id,
                membershipRole: 'MEMBER',
                isActive: false,
              },
            });
          }

          await tx.invitation.delete({
            where: {
              invitationId: { organisationId: invitation.organisationId, email: invitation.email }, 
            },
          });
        }
      });
    });

    return { event, body: { handled: true, count: invitations.length } };
  },
);
