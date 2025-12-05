import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSpinner } from '@/components/business/LoadingSpinner';

interface ProtectedRouteGuardProps {
  children: React.ReactNode;
}

export function ProtectedRouteGuard({ children }: ProtectedRouteGuardProps) {
  const { isAuthenticated, check } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await check();
      } catch (error) {
        // Auth check failed, user will be redirected
      } finally {
        setChecking(false);
      }
    };

    verifyAuth();
  }, [check]);

  if (checking) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Navigation will be handled by navigation system
    return null;
  }

  return <>{children}</>;
}

