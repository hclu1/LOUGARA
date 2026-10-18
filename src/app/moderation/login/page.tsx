'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ModerationLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return null;
}
