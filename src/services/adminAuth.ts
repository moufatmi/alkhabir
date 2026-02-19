import authService from './auth';

// Admin Authentication Service
export interface AdminUser {
  username: string;
  isAdmin: boolean;
}

const ADMIN_EMAILS = ['moussab@alkhabir.com', 'admin@alkhabir.com', 'moussab.fatmi@gmail.com'];

// Check if user is admin (Local Storage check)
export const isAdmin = (): boolean => {
  const adminData = localStorage.getItem('adminUser');
  if (!adminData) return false;

  try {
    const user: AdminUser = JSON.parse(adminData);
    return user.isAdmin;
  } catch {
    return false;
  }
};

// Admin login
export const adminLogin = async (email: string, password: string) => {
  // Sign in with Appwrite Auth
  await authService.login({ email, password });
  const user = await authService.getCurrentUser();

  if (!user) {
    throw new Error('login_failed');
  }

  // Check if email is in admin list
  if (ADMIN_EMAILS.includes(user.email)) {
    const adminUser: AdminUser = {
      username: user.name || user.email,
      isAdmin: true
    };
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
    return true;
  }

  // Not admin
  await authService.logout(); // Logout if not admin
  throw new Error('not_admin');
};

// Admin logout
export const adminLogout = async (): Promise<void> => {
  localStorage.removeItem('adminUser');
  await authService.logout();
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

// Utility: Set user role in Firestore by UID
// Deprecated/Removed as we don't use Firestore.
export const setUserRole = async (_uid: string, _role: 'admin' | 'client') => {
  console.warn("setUserRole is not implemented for Appwrite yet.");
}; 