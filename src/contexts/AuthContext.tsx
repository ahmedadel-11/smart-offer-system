import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { AuthContextType, UserDto, LoginRequest } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import {
  hasRole as checkRole,
  hasPermission as checkPermission,
  hasAnyRole as checkAnyRole,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
  isSuperAdmin as checkSuperAdmin,
  isManagerOrAbove as checkManagerOrAbove,
} from '../services/authorizationService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const storedToken = authService.getStoredToken();
    const storedUser = authService.getStoredUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);

      // Verify token by fetching fresh user data (re-evaluates roles/permissions)
      userService
        .getMe()
        .then((freshUser) => {
          setUser(freshUser);
          // Persist fresh user data so roles/permissions are up-to-date
          localStorage.setItem('smartoffer_user', JSON.stringify(freshUser));
        })
        .catch(() => {
          // Token invalid, clear and redirect
          authService.clearTokens();
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for 403 Forbidden events dispatched by api.ts interceptor
  useEffect(() => {
    const handleForbidden = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.warn('[Auth] 403 Forbidden:', detail);
      // Optionally: could show a toast here, but we don't force logout on 403
    };
    window.addEventListener('api:forbidden', handleForbidden);
    return () => window.removeEventListener('api:forbidden', handleForbidden);
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authService.login(request);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {
      // Ignore logout API errors
    });
    authService.clearTokens();
    setToken(null);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = authService.getStoredRefreshToken();
    if (storedRefreshToken) {
      try {
        const response = await authService.refresh({ refreshToken: storedRefreshToken });
        setToken(response.token);
        setUser(response.user);
      } catch {
        // Refresh failed — force logout
        authService.clearTokens();
        setToken(null);
        setUser(null);
      }
    }
  }, []);

  // -- Role & Permission helpers delegating to authorizationService --

  const hasRole = useCallback(
    (role: string) => checkRole(user, role),
    [user]
  );

  const hasPermission = useCallback(
    (permission: string) => checkPermission(user, permission),
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]) => checkAnyRole(user, roles),
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) => checkAnyPermission(user, permissions),
    [user]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]) => checkAllPermissions(user, permissions),
    [user]
  );

  const superAdmin = useMemo(() => checkSuperAdmin(user), [user]);
  const managerOrAbove = useMemo(() => checkManagerOrAbove(user), [user]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      refreshToken,
      hasRole,
      hasPermission,
      hasAnyRole,
      hasAnyPermission,
      hasAllPermissions,
      isSuperAdmin: superAdmin,
      isManagerOrAbove: managerOrAbove,
    }),
    [user, token, isLoading, login, logout, refreshToken, hasRole, hasPermission, hasAnyRole, hasAnyPermission, hasAllPermissions, superAdmin, managerOrAbove]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
