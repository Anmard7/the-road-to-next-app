import {
  LucideCircleCheckBig,
  LucideFileText,
  LucidePencil,
} from 'lucide-react';

export const TICKET_ICON = {
  OPEN: <LucideFileText />,
  IN_PROGRESS: <LucidePencil />,
  DONE: <LucideCircleCheckBig />,
};

export const TICKET_STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};
