import { WelcomeEmail } from '@/emails/auth/email-welcome';
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
    react: <WelcomeEmail toName={username} signinUrl={signinUrl} />,
  });
  
  return { data, error };
};
