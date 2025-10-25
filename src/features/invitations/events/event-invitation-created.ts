/**
 * This file contains the event handler for when a new invitation is created.
 * It is responsible for sending an email to the invited user.
 */
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { sendEmailInvitation } from '../emails/send-email-invitation';

/**
 * The arguments for the invitation.created event.
 */
export type InvitationCreateEventArgs = {
  data: {
    userId: string;
    organisationId: string;
    email: string;
    emailInvitationLink: string;
  };
};

/**
 * The event handler for when a new invitation is created.
 * This function is triggered by the 'app/invitation.created' event.
 * It sends an email to the invited user with a link to accept the invitation.
 */
export const eventInvitationCreated = inngest.createFunction(
  { id: 'invitation-created' },
  { event: 'app/invitation.created' },
  async ({ event }) => {
    const { userId, organisationId, email, emailInvitationLink } = event.data;

    // Get the user who created the invitation.
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    // Get the organisation for which the user is being invited.
    const organisation = await prisma.organisation.findUniqueOrThrow({
      where: {
        id: organisationId,
      },
    });

    // Send the email invitation.
    const result = await sendEmailInvitation(
      user.username,
      organisation.name,
      email,
      emailInvitationLink
    );

    // If there was an error sending the email, throw an error.
    if (result.error) {
      throw new Error(`${result.error.name}: ${result.error.message}`);
    }

    return { event, body: true };
  }
);