import { AccountTabs } from '@/app/_navigation/tabs';
import { CardCompact } from '@/components/card-compact';
import { Heading } from '@/components/heading';
import { PasswordChangeForm } from '@/features/password/components/password-change-form';

const PasswordPage = () => {
  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Heading
        title='Password'
        description='Keep your account secure'
        tabs={<AccountTabs />}
      />

      <div className='mx-auto flex w-full max-w-md flex-1 flex-col'>
        <CardCompact
          className='animate-fade-from-top w-full'
          title='Change Password'
          description='Enter your current password'
          content={<PasswordChangeForm />}
        />
      </div>
    </div>
  );
};

export default PasswordPage;
