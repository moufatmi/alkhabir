import { Client, Account, Databases, Storage, Functions, Teams } from 'appwrite';

/**
 * Appwrite Configuration
 * 
 * Initializes the Appwrite client using environment variables.
 * Exports service instances to be used throughout the application.
 */

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
    console.error('Appwrite configuration missing. Please check your .env file.');
} else {
    client
        .setEndpoint(endpoint)
        .setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const teams = new Teams(client);

export { client };
