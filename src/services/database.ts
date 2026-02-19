import { databases } from '../lib/appwrite';
import { ID, Query, Models } from 'appwrite';
import authService from './auth';

export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const CASES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CASES_COLLECTION_ID;

export interface CaseDocument extends Models.Document {
    user_id: string;
    title: string;
    description: string;
    status: 'pending' | 'processing' | 'completed';
    analysis_result: string;
    attachment_id?: string;
}

export type NewCaseData = Omit<CaseDocument, keyof Models.Document | 'user_id' | 'status' | 'analysis_result'>;

class DatabaseService {
    /**
     * Create a new legal case.
     * @param data - The case data (title, description, optional attachment)
     * @returns The created document
     */
    async createCase(data: NewCaseData): Promise<CaseDocument> {
        try {
            const user = await authService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to create a case');
            }

            const payload: Omit<CaseDocument, keyof Models.Document> = {
                ...data,
                user_id: user.$id,
                status: 'pending',
                analysis_result: '',
                // created_at is handled by Appwrite
            };

            return await databases.createDocument(
                DB_ID,
                CASES_COLLECTION_ID,
                ID.unique(),
                payload
            );
        } catch (error) {
            console.error('Appwrite service :: createCase :: error', error);
            throw error;
        }
    }

    /**
     * Get all cases for a specific user.
     * @param userId - The user's ID
     * @returns List of cases
     */
    async getUserCases(userId: string): Promise<CaseDocument[]> {
        try {
            const response = await databases.listDocuments<CaseDocument>(
                DB_ID,
                CASES_COLLECTION_ID,
                [
                    Query.equal('user_id', userId),
                    Query.orderDesc('$createdAt'),
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Appwrite service :: getUserCases :: error', error);
            throw error;
        }
    }

    /**
     * Get ALL cases (Admin only).
     * @returns List of all cases
     */
    async getAllCases(): Promise<CaseDocument[]> {
        try {
            const response = await databases.listDocuments<CaseDocument>(
                DB_ID,
                CASES_COLLECTION_ID,
                [
                    Query.orderDesc('$createdAt'),
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Appwrite service :: getAllCases :: error', error);
            throw error;
        }
    }

    /**
     * Get a single case by ID.
     * @param caseId - The document ID
     * @returns The case document
     */
    async getCaseById(caseId: string): Promise<CaseDocument> {
        try {
            return await databases.getDocument<CaseDocument>(
                DB_ID,
                CASES_COLLECTION_ID,
                caseId
            );
        } catch (error) {
            console.error('Appwrite service :: getCaseById :: error', error);
            throw error;
        }
    }

    /**
     * Update the analysis result of a case.
     * @param caseId - The document ID
     * @param analysis - The markdown analysis text
     * @returns The updated document
     */
    async updateCaseAnalysis(caseId: string, analysis: string): Promise<CaseDocument> {
        try {
            return await databases.updateDocument<CaseDocument>(
                DB_ID,
                CASES_COLLECTION_ID,
                caseId,
                {
                    analysis_result: analysis,
                    status: 'completed',
                }
            );
        } catch (error) {
            console.error('Appwrite service :: updateCaseAnalysis :: error', error);
            throw error;
        }
    }

    /**
   * Delete a case by ID.
   * @param caseId - The document ID
   */
    async deleteCase(caseId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DB_ID,
                CASES_COLLECTION_ID,
                caseId
            );
        } catch (error) {
            console.error('Appwrite service :: deleteCase :: error', error);
            throw error;
        }
    }

    // ==========================================
    // SUBSCRIPTIONS
    // ==========================================

    /**
     * Create a new subscription record.
     * @param data - The subscription data
     * @returns The created document
     */
    async createSubscription(data: any): Promise<Models.Document> {
        try {
            // We use a specific collection ID if provided, otherwise we might need to add it to env
            // For now, let's assume valid ID is available or throw error if not
            const SUBSCRIPTIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID;
            if (!SUBSCRIPTIONS_COLLECTION_ID) {
                throw new Error('VITE_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID is not defined');
            }

            const user = await authService.getCurrentUser();
            if (!user) throw new Error('User must be logged in');

            return await databases.createDocument(
                DB_ID,
                SUBSCRIPTIONS_COLLECTION_ID,
                ID.unique(),
                {
                    ...data,
                    user_id: user.$id,
                    // user_name: user.name, // If schema allows, good for admin view
                    user_email: user.email,
                }
            );
        } catch (error) {
            console.error('Appwrite service :: createSubscription :: error', error);
            throw error;
        }
    }

    /**
     * Get all subscriptions (Admin).
     * @returns List of subscriptions
     */
    async getAllSubscriptions(): Promise<Models.Document[]> {
        try {
            const SUBSCRIPTIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID;
            if (!SUBSCRIPTIONS_COLLECTION_ID) return [];

            const response = await databases.listDocuments(
                DB_ID,
                SUBSCRIPTIONS_COLLECTION_ID,
                [Query.orderDesc('$createdAt')]
            );
            return response.documents;
        } catch (error) {
            console.error('Appwrite service :: getAllSubscriptions :: error', error);
            return []; // Return empty on error to avoid crashing UI
        }
    }
}

export const databaseService = new DatabaseService();
export default databaseService;
