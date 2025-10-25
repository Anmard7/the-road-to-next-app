import { CardCompact } from "@/components/card-compact";
import { acceptInvitation } from "@/features/invitations/actions/accept-invitation";

type EmailInvitationPageProps = {
  params: Promise<{
    tokenId: string;
  }>;
};

const EmailInvitationPage = async ({ params }: EmailInvitationPageProps) => {
  const { tokenId } = await params;

  // Auto-accept the invitation on page load. On success, the action redirects.
  const result = await acceptInvitation(tokenId);

  // If we get here, acceptance failed. Show the error message.
  const message = result?.message || 'Invalid or expired invitation link.';

  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <CardCompact
        title="Invitation Error"
        description={message}
        className="w-full max-w-[420px] animate-fade-from-top"
        content={null}
      />
    </div>
  );
};

export default EmailInvitationPage;
