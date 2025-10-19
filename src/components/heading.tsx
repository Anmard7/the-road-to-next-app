import { Separator } from './ui/separator';
import { Tabs } from './ui/tabs';

type HeadingProps = {
  title: string;
  description?: string;
  tabs?: React.ReactNode;
  actions?: React.ReactNode;
};
const Heading = ({ title, description, tabs, actions }: HeadingProps) => {
  return (
    <>
      {tabs && <Tabs>{tabs}</Tabs>}
      <div className='flex items-center justify-between px-8'>
        <div>
          <h2 className='text-3xl font-bold tracking-tighter'>{title}</h2>
          {description && (
            <p className='text-muted-foreground text-sm'>{description}</p>
          )}
        </div>
        <div className='flex items-center gap-x-2'>{actions}</div>
      </div>
      <Separator />
    </>
  );
};

export { Heading };
