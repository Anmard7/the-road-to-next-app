import EmailVerification from '@/emails/auth/email-verification';
import { resend } from '@/lib/resend';

export const sendEmailVerification = async (
  username: string,
  email: string,
  verificationCode: string,
) => {
  const { data, error } = await resend.emails.send({
    from: 'no-reply@app.veritemp.uk',
    to: email,
    subject: 'Email Verification from TicketBounty',
    react: <EmailVerification toName={username} code={verificationCode} />,
  });

  if (error) {
    console.error(error);
  }
  return { data, error };
};