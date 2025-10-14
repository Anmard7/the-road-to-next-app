import { Section, Text } from '@react-email/components';
import { EmailButton } from '../components/email-button';
import { EmailFooter } from '../components/email-footer';
import { EmailGreeting } from '../components/email-greeting';
import { EmailHeader } from '../components/email-header';
import { EmailLayout } from '../components/email-layout';

type EmailWelcomeProps = {
  toName: string;
  signinUrl: string;
};

const EmailWelcome = ({ toName, signinUrl }: EmailWelcomeProps) => {
  return (
    <EmailLayout preview="Welcome to TicketBounty! 🎉">
      <EmailHeader appName="TicketBounty" />

      <EmailGreeting
        name={toName}
        title="Welcome to TicketBounty! 🎉"
        subtitle="We're excited to have you on board. Let's get you started with your new account."
      />

      <Section className="my-8 text-center">
        <EmailButton href={signinUrl}>Go to Dashboard</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="mb-4 text-base font-semibold text-gray-900">
          What&apos;s next?
        </Text>
        <Text className="mb-2 text-sm text-gray-600">
          ✓ Complete your profile
        </Text>
        <Text className="mb-2 text-sm text-gray-600">
          ✓ Create your first ticket
        </Text>
        <Text className="mb-2 text-sm text-gray-600">
          ✓ Explore available bounties
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

EmailWelcome.PreviewProps = {
  toName: 'John Doe',
  signinUrl: 'http://localhost:3000/tickets',
} as EmailWelcomeProps;

export default EmailWelcome;