import { Section, Text } from '@react-email/components';
import { EmailButton } from '../components/email-button';
import { EmailFooter } from '../components/email-footer';
import { EmailGreeting } from '../components/email-greeting';
import { EmailHeader } from '../components/email-header';
import { EmailLayout } from '../components/email-layout';

type EmailInvitationProps = {
  fromUser: string;
  fromOrganization: string;
  url: string;
};

const EmailInvitation = ({
  fromUser,
  fromOrganization,
  url,
}: EmailInvitationProps) => {
  return (
    <EmailLayout
      preview={`You have been invited to join ${fromOrganization} on TicketBounty.`}
    >
      <EmailHeader appName="TicketBounty" />

      <EmailGreeting
        name=""
        title={`You're invited to join ${fromOrganization}`}
        subtitle={`You have been invited to join ${fromOrganization} on TicketBounty by ${fromUser}.`}
      />

      <Section className="my-8 text-center">
        <EmailButton href={url}>Join {fromOrganization}</EmailButton>
      </Section>

      <Text className="text-sm text-gray-600">
        If you were not expecting this invitation, you can ignore this email.
      </Text>

      <EmailFooter
        appName="TicketBounty"
        companyAddress="123 Tech Street, San Francisco, CA 94105"
        privacyUrl="https://ticketbounty.com/privacy"
        termsUrl="https://ticketbounty.com/terms"
      />
    </EmailLayout>
  );
};

EmailInvitation.PreviewProps = {
  fromUser: "Andrei Mardaryev",
  fromOrganization: "TicketBounty",
  url: "http://localhost:3000/email-invitation/abc123",
} as EmailInvitationProps;

export default EmailInvitation;