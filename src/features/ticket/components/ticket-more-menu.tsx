'use client';
import { LucideTrash } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/components/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TicketStatus } from '@/generated/prisma';
import { deleteTicket } from '../actions/delete-ticket';
import { updateTicketStatus } from '../actions/update-ticket-status';
import { TICKET_STATUS_LABELS } from '../constants';
import { TicketWithMetadata } from '../types';

type TicketMoreMenuProps = {
  ticket: TicketWithMetadata;
  trigger: React.ReactElement;
};

export const TicketMoreMenu = ({ ticket, trigger }: TicketMoreMenuProps) => {
  const [deleteButton, deleteDialog] = useConfirmDialog({
    action: deleteTicket.bind(null, ticket.id),
    trigger: (
      <DropdownMenuItem>
        <LucideTrash className='h-4 w-4' />
        <span>Delete</span>
      </DropdownMenuItem>
    ),
  });
  const deleteButtonWithTooltip = ticket.permissions.canDeleteTicket ? (
    deleteButton
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuItem className='opacity-50'>
          <LucideTrash className='h-4 w-4' />
          <span>Delete</span>
        </DropdownMenuItem>
      </TooltipTrigger>
      <TooltipContent
        // variant={'secondary'}
        //intent={'secondaryArrow'}
        //className='bg-secondary text-secondary-foreground'
        side={'bottom'}
      >
        <span>Insufficient permissions</span>
      </TooltipContent>
    </Tooltip>
  );
  const handleUpdateTicketStatus = async (value: string) => {
    const promise = updateTicketStatus(ticket.id, value as TicketStatus);
    toast.promise(promise, {
      loading: 'Updating status...',
    });
    const result = await promise;
    if (result.status === 'ERROR') {
      toast.error(result.message);
    } else if (result.status === 'SUCCESS') {
      toast.success(result.message);
    }
  };
  const ticketStatusRadioGroupItems = (
    <DropdownMenuRadioGroup
      value={ticket.status}
      onValueChange={handleUpdateTicketStatus}
    >
      {(Object.keys(TICKET_STATUS_LABELS) as Array<TicketStatus>).map((key) => (
        <DropdownMenuRadioItem key={key} value={key}>
          {TICKET_STATUS_LABELS[key]}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );

  return (
    <>
      {deleteDialog}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' side='right'>
          {ticketStatusRadioGroupItems}
          <DropdownMenuSeparator />
          {deleteButtonWithTooltip}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
