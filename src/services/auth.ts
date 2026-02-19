import { account } from '../lib/appwrite';
import { ID, Models, OAuthProvider } from 'appwrite';

export interface User extends Models.User<Models.Preferences> { }

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    name: string;
}

class AuthService {
    /**
     * Log in a user with email and password.
     * @param credentials - Email and Password
     * @returns User session
     */
    async login({ email, password }: LoginCredentials): Promise<Models.Session> {
        try {
            return await account.createEmailPasswordSession(email, password);
        } catch (error) {
            console.error('Appwrite service :: login :: error', error);
            throw error;
        }
    }

    /**
     * Register a new user.
     * @param credentials - Email, Password, and Name
     * @returns The newly created user account
     */
    async register({ email, password, name }: RegisterCredentials): Promise<Models.User<Models.Preferences>> {
        try {
            const user = await account.create(ID.unique(), email, password, name);
            // Auto login after registration
            await this.login({ email, password });
            return user;
        } catch (error) {
            console.error('Appwrite service :: register :: error', error);
            throw error;
        }
    }

    /**
     * Log out the current user by deleting the current session.
     */
    async logout(): Promise<void> {
        try {
            await account.deleteSession('current');
        } catch (error) {
            console.error('Appwrite service :: logout :: error', error);
            throw error;
        }
    }

    /**
     * Get the currently logged-in user.
     * @returns The current user object or null if not authenticated.
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            return await account.get();
        } catch (error) {
            // It's common for this to fail if no session exists, so we return null instead of throwing
            console.log('Appwrite service :: getCurrentUser :: no active session');
            return null;
        }
    }

    /**
     * Initiate Google OAuth login.
     * This will redirect the user to Google for authentication.
     */
    async loginWithGoogle(): Promise<void> {
        try {
            // Configure redirect URLs - adjust these based on your environment
            const successUrl = `${window.location.origin}/dashboard`;
            const failureUrl = `${window.location.origin}/login`;

            account.createOAuth2Session(
                OAuthProvider.Google,
                successUrl,
                failureUrl
            );
        } catch (error) {
            console.error('Appwrite service :: loginWithGoogle :: error', error);
            throw error;
        }
    }
    /**
     * Update the user's name.
     * @param name - New name
     * @returns The updated user
     */
    async updateName(name: string): Promise<Models.User<Models.Preferences>> {
        try {
            return await account.updateName(name);
        } catch (error) {
            console.error('Appwrite service :: updateName :: error', error);
            throw error;
        }
    }

    /**
     * Update the user's password.
     * @param password - New password
     * @param oldPassword - Old password (required for security)
     * @returns The updated user
     */
    async updatePassword(password: string, oldPassword?: string): Promise<Models.User<Models.Preferences>> {
        try {
            return await account.updatePassword(password, oldPassword);
        } catch (error) {
            console.error('Appwrite service :: updatePassword :: error', error);
            throw error;
        }
    }

    /**
     * Check if the current user is an Admin (member of 'Admins' team).
     * @returns True if admin, False otherwise
     */
    async isAdmin(): Promise<boolean> {
        try {
            // Import teams from our lib instance
            const { teams } = await import('../lib/appwrite');

            // Priority 1: Check by Team ID if available (More robust)
            const adminTeamId = import.meta.env.VITE_APPWRITE_ADMIN_TEAM_ID;
            if (adminTeamId) {
                try {
                    console.log('Appwrite service :: isAdmin :: checking by ID', adminTeamId);
                    await teams.get(adminTeamId);
                    // If this succeeds, we are a member (Team Get requires membership)
                    console.log('Appwrite service :: isAdmin :: Is Admin (Confirmed by ID)');
                    return true;
                } catch (getIdError) {
                    console.warn('Appwrite service :: isAdmin :: checking by ID failed', getIdError);
                    // If 404 or 401, we are not a member of this specific team. 
                    // We continue to list check just in case, or return false?
                    // Let's continue to list check as fallback.
                }
            }

            // Priority 2: List teams (Fallback)
            const teamList = await teams.list();
            console.log('Appwrite service :: isAdmin :: teamList', teamList);
            const isMember = teamList.teams.some((team: Models.Team) => team.name === 'Admins');
            console.log('Appwrite service :: isAdmin :: isMember', isMember);
            return isMember;
        } catch (error) {
            console.error('Appwrite service :: isAdmin :: error', error);
            return false;
        }
    }
}

export const authService = new AuthService();
export default authService;
