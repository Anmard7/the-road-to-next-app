import { CardCompact } from '@/components/card-compact';
import { OrganisationCreateForm } from '@/features/organisation/components/organisation-create-form';

const OrganisationCreatePage = () => {
  return (
    <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center'>
      <CardCompact
        title='Create Organisation'
        description='Create a new organisation for your team'
        className='animate-fade-from-top w-full'
        content={<OrganisationCreateForm />}
      />
    </div>
  );
};

export default OrganisationCreatePage;
