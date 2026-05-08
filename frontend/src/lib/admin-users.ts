export type AdminUser = {
  id: string;
  fullName: string;
  initials: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Sales';
  phone: string | null;
  isActive: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'solar-crm-admin-users';

export const defaultAdminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    fullName: 'Sistem Yöneticisi',
    initials: 'SY',
    email: 'admin@company.com',
    role: 'Admin',
    phone: '+90 212 555 0001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'admin-2',
    fullName: 'Gamze Kılınç',
    initials: 'GK',
    email: 'gamze@company.com',
    role: 'Sales',
    phone: '+90 532 000 0001',
    isActive: true,
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeOptional = (value: FormDataEntryValue | null) => {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : null;
};

const normalizeRole = (value: FormDataEntryValue | null): AdminUser['role'] => {
  const role = String(value ?? 'Sales');
  return role === 'Admin' || role === 'Manager' || role === 'Sales' ? role : 'Sales';
};

const createInitials = (fullName: string) => {
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toLocaleUpperCase('tr-TR');
};

const normalizeInitials = (value: FormDataEntryValue | string | null, fullName: string) => {
  const initials = String(value ?? '').trim();
  return (initials || createInitials(fullName)).slice(0, 4).toLocaleUpperCase('tr-TR');
};

const normalizeUser = (user: Partial<AdminUser>): AdminUser => {
  const now = new Date().toISOString();
  const fullName = user.fullName ?? '';

  return {
    id: user.id ?? createId(),
    fullName,
    initials: normalizeInitials(user.initials ?? null, fullName),
    email: user.email ?? '',
    role: user.role ?? 'Sales',
    phone: user.phone ?? null,
    isActive: user.isActive ?? true,
    createdAt: user.createdAt ?? now,
  };
};

export function getAdminUsers() {
  if (typeof window === 'undefined') return defaultAdminUsers;

  const rawUsers = window.localStorage.getItem(STORAGE_KEY);
  if (!rawUsers) return defaultAdminUsers;

  try {
    const users = JSON.parse(rawUsers) as Partial<AdminUser>[];
    return users.map(normalizeUser).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } catch {
    return defaultAdminUsers;
  }
}

export function addAdminUser(formData: FormData) {
  const fullName = String(formData.get('fullName') ?? '').trim();
  const user: AdminUser = {
    id: createId(),
    fullName,
    initials: normalizeInitials(formData.get('initials'), fullName),
    email: String(formData.get('email') ?? '').trim(),
    role: normalizeRole(formData.get('role')),
    phone: normalizeOptional(formData.get('phone')),
    isActive: formData.get('status') === 'active',
    createdAt: new Date().toISOString(),
  };

  const users = [user, ...getAdminUsers()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return user;
}

export function setAdminUserStatus(id: string, isActive: boolean) {
  const users = getAdminUsers().map((user) => user.id === id ? { ...user, isActive } : user);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return users;
}
