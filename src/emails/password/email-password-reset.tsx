import { Section, Text } from '@react-email/components';
import { EmailAlert } from '../components/email-alert';
import { EmailButton } from '../components/email-button';
import { EmailFooter } from '../components/email-footer';
import { EmailGreeting } from '../components/email-greeting';
import { EmailHeader } from '../components/email-header';
import { EmailLayout } from '../components/email-layout';

type EmailPasswordResetProps = {
  toName: string;
  url: string;
};

const EmailPasswordReset = ({ toName, url }: EmailPasswordResetProps) => {
  return (
    <EmailLayout preview="Reset your TicketBounty password">
      <EmailHeader appName="TicketBounty" />

      <EmailGreeting
        name={toName}
        title="Password Reset Request"
        subtitle="We received a request to reset your password. Click the button below to create a new password."
      />

      <Section className="my-8 text-center">
        <EmailButton href={url}>Reset Your Password</EmailButton>
      </Section>

      <EmailAlert type="warning">
        This password reset link will expire in 2 hours for security reasons.
      </EmailAlert>

      <Section className="my-6">
        <Text className="mb-2 text-sm text-gray-600">
          If you didn&apos;t request a password reset, you can safely ignore this
          email. Your password will remain unchanged.
        </Text>
        <Text className="mb-0 text-sm text-gray-600">
          For security reasons, this link can only be used once.
        </Text>
      </Section>

      <Section className="my-6 rounded-lg bg-gray-50 p-4">
        <Text className="mb-2 text-xs font-semibold text-gray-700">
          🔒 Security Tips:
        </Text>
        <Text className="m-0 text-xs leading-relaxed text-gray-600">
          • Never share your password with anyone
          <br />
          • Use a unique password for TicketBounty
          <br />
          • Enable two-factor authentication if available
        </Text>
      </Section>

      <EmailFooter
        appName="TicketBounty"
        companyAddress="123 Tech Street, San Francisco, CA 94105"
        privacyUrl="https://ticketbounty.com/privacy"
        termsUrl="https://ticketbounty.com/terms"
      />
    </EmailLayout>
  );
};

EmailPasswordReset.PreviewProps = {
  toName: 'John Doe',
  url: 'http://localhost:3000/password-reset/1234567890',
} as EmailPasswordResetProps;

export default EmailPasswordReset;