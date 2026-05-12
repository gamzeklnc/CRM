import { api } from './api';

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

const createInitials = (fullName: string) => {
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toLocaleUpperCase('tr-TR');
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get('/auth/users');
  if (!response.ok) return [];
  
  const users = await response.json();
  return users.map((u: any) => ({
    ...u,
    initials: createInitials(u.fullName)
  }));
}

export async function addAdminUser(data: any) {
  const response = await api.post('/auth/users', data);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kullanıcı oluşturulamadı');
  }
  return await response.json();
}

export async function setAdminUserStatus(id: string, isActive: boolean) {
  // Assuming there's an update endpoint, but for status we might need a specific one or use general update
  // For now, let's assume we can update the user
  const response = await api.put(`/auth/users/${id}`, { isActive });
  return response.ok;
}
