import { Suspense, ReactNode } from 'react';
import { LoadingPage } from './LoadingSpinner';

interface RouteSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RouteSuspense({ children, fallback = <LoadingPage /> }: RouteSuspenseProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

