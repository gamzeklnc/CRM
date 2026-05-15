export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Sales';
  isActive: boolean;
};

const TOKEN_KEY = 'crm-token';
const USER_KEY = 'crm-user';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5296/api';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

function normalizeUser(user: any): AuthUser {
  return {
    id: user.userId || user.id || user.UserId || user.Id,
    fullName: user.fullName || user.FullName || '',
    email: user.email || user.Email || '',
    role: user.role || user.Role || 'Sales',
    isActive: user.isActive ?? user.IsActive ?? true
  };
}

export function saveCurrentUser(user: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(user)));
}

export async function refreshCurrentUser(): Promise<AuthUser | null> {
  if (typeof window === 'undefined') return null;
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return getCurrentUser();

  const user = await response.json();
  saveCurrentUser(user);
  return getCurrentUser();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function hasRole(roles: string | string[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  return user.role === roles;
}

export function login(token: string, user: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  saveCurrentUser(user);
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
}

// Keeping these for compatibility with existing components during transition
export function isCurrentUserAdmin() {
  return hasRole('Admin');
}

export function setCurrentUserByEmail(email: string) {
  // This was for the mock, we don't need it for real JWT but keeping signature to avoid breaks
  console.log('setCurrentUserByEmail called with:', email);
}
