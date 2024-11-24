import { Client, Users, Databases, Storage, Account } from 'node-appwrite';

const client = new Client();

if (!process.env.APPWRITE_ENDPOINT) throw new Error('Missing Appwrite Endpoint');
if (!process.env.APPWRITE_PROJECT_ID) throw new Error('Missing Appwrite Project ID');
if (!process.env.APPWRITE_API_KEY) throw new Error('Missing Appwrite API Key');

client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

export const users = new Users(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

export default client;