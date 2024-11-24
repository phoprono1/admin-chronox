import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) 
    throw new Error('Missing Appwrite Endpoint');
if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) 
    throw new Error('Missing Appwrite Project ID');

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;