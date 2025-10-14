import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
} from '@react-email/components';

type EmailLayoutProps = {
  preview: string;
  children: React.ReactNode;
};

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded-lg bg-white px-8 py-10 shadow-lg">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};