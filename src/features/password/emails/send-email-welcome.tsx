import EmailWelcome from '@/emails/auth/email-welcome';
import { resend } from '@/lib/resend';

export const sendEmailWelcome = async (
  username: string,
  email: string,
  signinUrl: string,
) => {
  const { data, error } = await resend.emails.send({
    from: 'no-reply@app.veritemp.uk',
    to: email,
    subject: 'Welcome to TicketBounty',
    react: <EmailWelcome toName={username} signinUrl={signinUrl} />,
  });

  if (error) {
    console.error(error);
  }
  return data;
};
