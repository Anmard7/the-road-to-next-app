export const homePath = () => '/';
export const ticketsPath = () => '/tickets';
export const ticketPath = (ticketId: string) => `${ticketsPath()}/${ticketId}`;
export const ticketEditPath = (ticketId: string) =>
  `${ticketPath(ticketId)}/edit`;

export const signUpPath = () => '/sign-up';
export const signInPath = () => '/sign-in';
export const passwordForgotPath = () => '/password-forgot';

export const accountProfilePath = () => '/account/profile';
export const accountPasswordPath = () => '/account/password';
