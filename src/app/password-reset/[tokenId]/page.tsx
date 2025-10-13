import { CardCompact } from '@/components/card-compact';
import { PasswordResetForm } from '@/features/password/components/password-reset-form';

type PasswordResetPageProps = {
  params: Promise<{ tokenId: string }>;
};

const PasswordResetPage = async ({ params }: PasswordResetPageProps) => {
  const { tokenId } = await params;

  return (
    <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center'>
      <CardCompact
        className='animate-fade-from-top w-full'
        title='New Password'
        description='Enter your new password for your account'
        content={<PasswordResetForm tokenId={tokenId} />}
      />
    </div>
  );
};

export default PasswordResetPage;
