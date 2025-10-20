import { LucideLoaderCircle, LucideUserPen } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getAuth } from '@/features/auth/queries/get-auth';
import { getActiveOrganisationSafe } from '@/features/organisation/queries/get-active-organisation-safe';
import { organisationsPath, selectActiveOrganisationPath } from '@/paths';

const DataContent = async () => {
  const result = await getActiveOrganisationSafe();

  if (!result) return null;

  return (
    <>
      <span className='text-muted-foreground text-sm'>
        Current organisation:{' '}
        {result.error
          ? 'No Data'
          : result.activeOrganisation
            ? result.activeOrganisation.name
            : 'Not Selected'}
      </span>
      {!result.error && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant='outline'
              size='xs'
              aria-label={
                result.activeOrganisation
                  ? 'Switch organisation'
                  : 'Pick organisation'
              }
            >
              <Link
                href={
                  result.activeOrganisation
                    ? organisationsPath()
                    : selectActiveOrganisationPath()
                }
              >
                <LucideUserPen className='size-4' />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {result.activeOrganisation
                ? 'Switch organisation'
                : 'Pick organisation'}
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
};

const Footer = async () => {
  const { user } = await getAuth();

  if (!user) return null;

  return (
    <footer
      role='contentinfo'
      aria-label="User's active organisation status"
      className='supports-backdrop-blur:bg-background/60 bg-background/95 animate-footer-from-bottom fixed inset-x-0 bottom-0 border-t p-2 backdrop-blur'
    >
      <div className='flex max-h-6 items-center justify-end gap-x-2'>
        <Suspense
          fallback={
            <div className='flex items-center gap-x-2'>
              <span className='text-muted-foreground text-sm'>Loading...</span>
              <LucideLoaderCircle className='size-4 animate-spin' />
            </div>
          }
        >
          <DataContent />
        </Suspense>
      </div>
    </footer>
  );
};

export { Footer };
