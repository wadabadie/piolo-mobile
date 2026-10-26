// src/components/RoleGuard.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** @param {string[]} allowedRoles - Ex: ['BAILLEUR'] */
export default function RoleGuard({ allowedRoles = [] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  const hasAdminPrivileges = allowedRoles.includes('ADMIN') && (user.role === 'ADMIN' || user.is_staff || user.is_superuser);
  if (allowedRoles.length && !allowedRoles.includes(user.role) && !hasAdminPrivileges)
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
