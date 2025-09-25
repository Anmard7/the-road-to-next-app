import { AccountTabs } from '@/app/_navigation/tabs';
import { Heading } from '@/components/heading';

const PasswordPage = () => {
  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Heading
        title='Password'
        description='Keep your account secure'
        tabs={<AccountTabs />}
      />
    </div>
  );
};

export default PasswordPage;
