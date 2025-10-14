import { Hr, Link, Section, Text } from '@react-email/components';

type EmailFooterProps = {
  appName: string;
  companyAddress?: string;
  unsubscribeUrl?: string;
  privacyUrl?: string;
  termsUrl?: string;
};

export const EmailFooter = ({
  appName,
  companyAddress,
  unsubscribeUrl,
  privacyUrl,
  termsUrl,
}: EmailFooterProps) => {
  return (
    <>
      <Hr className="my-8 border-gray-200" />
      <Section className="text-center">
        <Text className="mb-4 text-xs text-gray-500">
          This email was sent by {appName}
          {companyAddress && ` • ${companyAddress}`}
        </Text>
        
        {(privacyUrl || termsUrl || unsubscribeUrl) && (
          <Text className="mb-2 text-xs text-gray-400">
            {privacyUrl && (
              <>
                <Link href={privacyUrl} className="text-gray-500 underline">
                  Privacy Policy
                </Link>
                {(termsUrl || unsubscribeUrl) && ' • '}
              </>
            )}
            {termsUrl && (
              <>
                <Link href={termsUrl} className="text-gray-500 underline">
                  Terms of Service
                </Link>
                {unsubscribeUrl && ' • '}
              </>
            )}
            {unsubscribeUrl && (
              <Link href={unsubscribeUrl} className="text-gray-500 underline">
                Unsubscribe
              </Link>
            )}
          </Text>
        )}
      </Section>
    </>
  );
};