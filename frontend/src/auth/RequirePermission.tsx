import { JSX } from 'react';
import { useAuth } from './AuthContext';
import { AccessDeniedPage } from '../pages/AccessDenied';

/**
 * Route level guard. Renders the wrapped element only when the current user
 * holds at least one of `anyPerm` (admin always passes, via hasPermission).
 * Otherwise it renders the Access Denied page. Pass no perms for an
 * authenticated-only route that everyone can see.
 */
export function RequirePermission({ anyPerm, children }: { anyPerm?: string[]; children: JSX.Element }) {
  const { hasPermission } = useAuth();
  if (!anyPerm || anyPerm.length === 0) return children;
  const allowed = anyPerm.some((p) => hasPermission(p));
  return allowed ? children : <AccessDeniedPage />;
}
