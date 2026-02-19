import { Client, Account, Databases, Storage, Teams, Functions } from 'appwrite';

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
export const teams = new Teams(client);
export const functions = new Functions(client);

export default client;
