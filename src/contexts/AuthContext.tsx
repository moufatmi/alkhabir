import React, { createContext, useContext, useEffect, useState } from 'react';
import authService, { User, LoginCredentials, RegisterCredentials } from '../services/auth';
import { Models } from 'appwrite';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<Models.Session>;
    register: (credentials: RegisterCredentials) => Promise<Models.User<Models.Preferences>>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    updateName: (name: string) => Promise<Models.User<Models.Preferences>>;
    updatePassword: (password: string, oldPassword?: string) => Promise<Models.User<Models.Preferences>>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            if (currentUser) {
                const adminStatus = await authService.isAdmin();
                setIsAdmin(adminStatus);
            } else {
                setIsAdmin(false);
            }
        } catch (error) {
            setUser(null);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        const session = await authService.login(credentials);
        await checkUserStatus();
        return session;
    };

    const register = async (credentials: RegisterCredentials) => {
        const newUser = await authService.register(credentials);
        await checkUserStatus();
        return newUser;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsAdmin(false);
    };

    const loginWithGoogle = async () => {
        await authService.loginWithGoogle();
    };

    const updateName = async (name: string) => {
        const updatedUser = await authService.updateName(name);
        setUser(updatedUser);
        return updatedUser;
    };

    const updatePassword = async (password: string, oldPassword?: string) => {
        const updatedUser = await authService.updatePassword(password, oldPassword);
        setUser(updatedUser);
        return updatedUser;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            loginWithGoogle,
            updateName,
            updatePassword,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
