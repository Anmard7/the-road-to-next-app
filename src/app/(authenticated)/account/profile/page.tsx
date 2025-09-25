import { AccountTabs } from '@/app/_navigation/tabs';
import { Heading } from '@/components/heading';

const ProfilePage = () => {
  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Heading
        title='Profile'
        description='Your profile information'
        tabs={<AccountTabs />}
      />
    </div>
  );
};

export default ProfilePage;
