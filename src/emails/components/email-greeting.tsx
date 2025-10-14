import { Heading, Text } from '@react-email/components';

type EmailGreetingProps = {
  name: string;
  title: string;
  subtitle?: string;
};

export const EmailGreeting = ({
  name,
  title,
  subtitle,
}: EmailGreetingProps) => {
  return (
    <>
      <Text className="mb-2 text-base text-gray-600">
        Hello {name},
      </Text>
      <Heading className="mb-4 mt-0 text-2xl font-bold text-gray-900">
        {title}
      </Heading>
      {subtitle && (
        <Text className="mb-6 text-base leading-relaxed text-gray-600">
          {subtitle}
        </Text>
      )}
    </>
  );
};