import { Button } from '@react-email/components';
import { cn } from '@/lib/utils';

type EmailButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
};

export const EmailButton = ({
  href,
  children,
  variant = 'primary',
}: EmailButtonProps) => {
  const baseStyles =
    'inline-block rounded-lg px-8 py-4 text-center text-base font-semibold no-underline';

  const variantStyles: Record<NonNullable<EmailButtonProps['variant']>, string> = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-100 text-gray-900 border border-gray-400',
  };

  return (
    <Button
      href={href}
      className={cn(baseStyles, variantStyles[variant])}
    >
      {children}
    </Button>
  );
};
