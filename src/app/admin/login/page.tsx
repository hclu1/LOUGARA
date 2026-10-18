'use client';

import React from 'react';
import { AdminRoleLoginGate } from '@/components/AdminRoleLoginGate';

export default function AdminLoginPage() {
  return <AdminRoleLoginGate redirectTo="/admin" />;
}
