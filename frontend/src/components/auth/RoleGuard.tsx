"use client";

import { hasRole } from '@/lib/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: 'Admin' | 'Manager' | 'Sales' | Array<'Admin' | 'Manager' | 'Sales'>;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
