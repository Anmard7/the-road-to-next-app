export const homePath = () => '/';
export const ticketsPath = () => '/tickets';
export const ticketPath = (ticketId: string) => `${ticketsPath()}/${ticketId}`;
export const ticketEditPath = (ticketId: string) => `${ticketPath(ticketId)}/edit`;