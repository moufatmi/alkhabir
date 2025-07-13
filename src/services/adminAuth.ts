// Admin Authentication Service
export interface AdminUser {
  username: string;
  isAdmin: boolean;
}

const ADMIN_CREDENTIALS = {
  username: 'moussab',
  password: 'moussab123'
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const adminData = localStorage.getItem('adminUser');
  if (!adminData) return false;
  
  try {
    const user: AdminUser = JSON.parse(adminData);
    return user.isAdmin && user.username === ADMIN_CREDENTIALS.username;
  } catch {
    return false;
  }
};

// Admin login
export const adminLogin = (username: string, password: string): boolean => {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const adminUser: AdminUser = {
      username: username,
      isAdmin: true
    };
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
    return true;
  }
  return false;
};

// Admin logout
export const adminLogout = (): void => {
  localStorage.removeItem('adminUser');
};

// Get current admin user
export const getCurrentAdmin = (): AdminUser | null => {
  const adminData = localStorage.getItem('adminUser');
  if (!adminData) return null;
  
  try {
    return JSON.parse(adminData);
  } catch {
    return null;
  }
}; 