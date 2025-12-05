import React from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface GuestRouteGuardProps {
  children: React.ReactNode;
}

export function GuestRouteGuard({ children }: GuestRouteGuardProps) {
  const { isAuthenticated } = useAuthStore();

  // If authenticated, navigation system will handle redirect
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

