import { redirect } from 'next/navigation';

export default function ModerationLoginRedirectPage() {
  redirect('/admin/login');
}
