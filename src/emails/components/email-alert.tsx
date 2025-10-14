import { Section, Text } from '@react-email/components';

type EmailAlertProps = {
  type?: 'info' | 'warning' | 'success' | 'error';
  children: React.ReactNode;
};

export const EmailAlert = ({ type = 'info', children }: EmailAlertProps) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <Section
      className={`my-6 rounded-lg border-l-4 p-4 ${styles[type]}`}
    >
      <Text className="m-0 text-sm">{children}</Text>
    </Section>
  );
};