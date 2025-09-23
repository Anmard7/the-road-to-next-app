import type { ReactElement } from 'react';

export type NavItem = {
  separator?: boolean;
  title: string;
  icon: ReactElement<{ className?: string }>;
  href: string;
};
