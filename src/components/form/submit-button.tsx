'use client';

import { LucideLoaderCircle, LucideProps } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';

type SubmitButtonProps = {
  label?: string;
  icon?: React.ReactElement<LucideProps>;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  disabled?: boolean;
};

const SubmitButton = ({
  label,
  icon,
  variant,
  size,
  disabled,
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending || disabled}
      type='submit'
      variant={variant}
      size={size}
    >
      {pending ? (
        <LucideLoaderCircle className='size-4 animate-spin' />
      ) : icon ? (
        <icon.type {...icon.props} />
      ) : null}
      {label}
    </Button>
  );
};

export { SubmitButton };
