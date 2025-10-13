import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
type EmailPasswordResetProps = {
  toName: string;
  url: string;
};

const EmailPasswordReset = ({ toName, url }: EmailPasswordResetProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className='m-8 text-center font-sans'>
          <Container>
            <Section>
              <Text>
                Hello {toName}, you have requested a password reset. Click the
                button below to reset your password.
              </Text>
            </Section>
            <Section>
              <Button
                href={url}
                className='m-2 rounded bg-black p-2 text-white dark:bg-white dark:text-black'
              >
                Reset Password
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
EmailPasswordReset.PreviewProps = {
  toName: 'John Doe',
  url: 'http://localhost:3000/password-reset/1234567890',
};
export default EmailPasswordReset;
