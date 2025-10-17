import { Section, Text } from '@react-email/components';
import { EmailAlert } from '../components/email-alert';
import { EmailFooter } from '../components/email-footer';
import { EmailGreeting } from '../components/email-greeting';
import { EmailHeader } from '../components/email-header';
import { EmailLayout } from '../components/email-layout';

type EmailVerificationProps = {
  toName: string;
  code: string;
};

const EmailVerification = ({ toName, code }: EmailVerificationProps) => {
  return (
    <EmailLayout preview="Reset your TicketBounty password">
      <EmailHeader appName="TicketBounty" />

      <EmailGreeting
        name={toName}
        title="Email Verification Code"
        subtitle="Please verify your email address by using the code below."
      />

      <Section className="my-8 text-center">
        <Text className="text-base font-semibold text-gray-900">{code}</Text>
      </Section>

      <EmailAlert type="warning">
        This code will expire in 15 minutes for security reasons.
      </EmailAlert>

      <Section className="my-6">
        <Text className="mb-0 text-sm text-gray-600">
          For security reasons, this code can only be used once.
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

EmailVerification.PreviewProps = {
  toName: 'John Doe',
  code: 'ABCDEFGH',
} as EmailVerificationProps;

export default EmailVerification;