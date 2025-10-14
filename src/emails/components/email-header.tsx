import { Heading, Img, Section } from '@react-email/components';

type EmailHeaderProps = {
  logoUrl?: string;
  logoAlt?: string;
  appName: string;
};

export const EmailHeader = ({
  logoUrl,
  logoAlt = 'Logo',
  appName,
}: EmailHeaderProps) => {
  return (
    <Section className="mb-8 text-center">
      {logoUrl && (
        <Img
          src={logoUrl}
          alt={logoAlt}
          width="48"
          height="48"
          className="mx-auto mb-4"
        />
      )}
      <Heading className="m-0 text-2xl font-bold text-gray-900">
        {appName}
      </Heading>
    </Section>
  );
};