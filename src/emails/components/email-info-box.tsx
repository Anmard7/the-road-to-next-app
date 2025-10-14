import { Section, Text } from '@react-email/components';

type EmailInfoBoxProps = {
  label: string;
  value: string;
};

export const EmailInfoBox = ({ label, value }: EmailInfoBoxProps) => {
  return (
    <Section className="my-4 rounded-lg bg-gray-50 p-4">
      <Text className="m-0 mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </Text>
      <Text className="m-0 font-mono text-sm text-gray-900">
        {value}
      </Text>
    </Section>
  );
};