import { Placeholder } from '@/components/placeholder';
import { buttonVariants } from '@/components/ui/button';
import { ticketsPath } from '@/paths';

export default function NotFound() {
  return (
    <Placeholder
      label='Ticket not found'
      button={
        <a
          href={ticketsPath()}
          className={buttonVariants({ variant: 'outline' })}
        >
          Go to Tickets
        </a>
      }
    />
  );
}
