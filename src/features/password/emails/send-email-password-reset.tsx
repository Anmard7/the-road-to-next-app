import EmailPasswordReset from '@/emails/password/email-password-reset';
import { resend } from '@/lib/resend';

export const sendEmailPasswordReset = async (
  username: string,
  email: string,
  passwordResetLink: string,
) => {
  const { data, error } = await resend.emails.send({
    from: 'no-reply@app.veritemp.uk',
    to: email,
    subject: 'Password Reset from TicketBounty',
    react: <EmailPasswordReset toName={username} url={passwordResetLink} />,
  });

  if (error) {
    console.error(error);
  }
  return { data, error };
};