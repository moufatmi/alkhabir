import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
export const adminLogin = async (email: string, password: string) => {
  // Sign in with Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Check Firestore for admin role
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists() && userDoc.data().role === 'admin') {
    return true;
  }
  // Not admin
  throw new Error('not_admin');
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

// Utility: Set user role in Firestore by UID
export const setUserRole = async (uid: string, role: 'admin' | 'client') => {
  const userRef = doc(db, 'users', uid);
  // If the document exists, update; otherwise, create
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    await updateDoc(userRef, { role });
  } else {
    await setDoc(userRef, { role });
  }
}; 