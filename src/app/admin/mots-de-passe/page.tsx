'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminRoleLoginGate } from '@/components/AdminRoleLoginGate';
import { AdminPasswordValidationPanel } from '@/components/AdminPasswordValidationPanel';

export default function AdminPasswordValidationsPage() {
  const { isModerator, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold">Vérification des droits d&apos;accès...</span>
        </div>
      </div>
    );
  }

  if (!isModerator) {
    return <AdminRoleLoginGate />;
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminPasswordValidationPanel embedded={false} />
      </div>
    </div>
  );
}
