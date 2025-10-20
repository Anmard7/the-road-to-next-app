import { getAdminOrRedirect } from '@/features/membership/queries/get-admin-or-redirect';

export default async function AdminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ organisationId: string }>;
}> & {
  children: React.ReactNode;
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  await getAdminOrRedirect(organisationId);

  return <>{children}</>;
}
