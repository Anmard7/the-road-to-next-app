import EmailInvitation from '@/emails/invitations/email-invitation';
import { resend } from '@/lib/resend';

export const sendEmailInvitation = async (
  username: string,
  organisationName: string,
  email: string,
  emailInvitationLink: string,
) => {
  return await resend.emails.send({
    // your own custom domain here
    // or your email that you used to sign up at Resend
    from: 'no-reply@app.veritemp.uk',
    to: email,
    subject: `Invitation to ${organisationName} from TicketBounty`,
    react: (
      <EmailInvitation
        fromUser={username}
        fromOrganization={organisationName}
        url={emailInvitationLink}
      />
    ),
  });
};
