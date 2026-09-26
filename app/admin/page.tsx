import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import AdminClient from './admin-client';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'จัดการข้อมูลคลังความรู้' };

export default async function AdminPage() {
  const session = await requireAdmin();
  if (!session) redirect('/login');
  return <AdminClient username={session.username} />;
}
