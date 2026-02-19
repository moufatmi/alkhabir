import { storage } from '../lib/appwrite';
import { ID } from 'appwrite';

const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

class StorageService {
    /**
     * Upload a file to the Appwrite storage bucket.
     * @param file - The file object (from input[type="file"])
     * @returns The file ID
     */
    async uploadCaseFile(file: File): Promise<string> {
        try {
            if (!BUCKET_ID) {
                throw new Error('Storage Bucket ID is not configured');
            }

            const response = await storage.createFile(
                BUCKET_ID,
                ID.unique(),
                file
            );
            return response.$id;
        } catch (error) {
            console.error('Appwrite service :: uploadCaseFile :: error', error);
            throw error;
        }
    }

    /**
     * Get the URL to view a file.
     * @param fileId - The file ID
     * @returns The view URL
     */
    getFileView(fileId: string): string {
        if (!BUCKET_ID) {
            console.error('Storage Bucket ID is not configured');
            return '';
        }

        // getFileView returns a URL string
        return storage.getFileView(BUCKET_ID, fileId).toString();
    }
}

export const storageService = new StorageService();
export default storageService;
