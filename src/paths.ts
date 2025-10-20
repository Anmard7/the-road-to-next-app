export const homePath = () => '/';
export const ticketsPath = () => '/tickets';
export const ticketPath = (ticketId: string) => `${ticketsPath()}/${ticketId}`;
export const ticketEditPath = (ticketId: string) =>
  `${ticketPath(ticketId)}/edit`;

export const signUpPath = () => '/sign-up';
export const signInPath = () => '/sign-in';

export const emailVerificationPath = () => '/email-verification';

export const passwordForgotPath = () => '/password-forgot';
export const passwordResetPath = () => '/password-reset';

export const accountProfilePath = () => '/account/profile';
export const accountPasswordPath = () => '/account/password';

export const onboardingPath = () => '/onboarding';
export const selectActiveOrganisationPath = () =>
  `${onboardingPath()}/select-active-organisation`;

export const organisationsPath = () => '/organisation';
export const organisationCreatePath = () => `${organisationsPath()}/create`;
export const organisationPath = (organisationId: string) =>
  `${organisationsPath()}/${organisationId}`;
export const organisationEditPath = (organisationId: string) =>
  `${organisationPath(organisationId)}/edit`;
export const organisationDeletePath = (organisationId: string) =>
  `${organisationPath(organisationId)}/delete`;
export const membershipsPath = (organisationId: string) =>
  `${organisationPath(organisationId)}/memberships`;
