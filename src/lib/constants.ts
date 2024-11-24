export const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  collections: {
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
    posts: process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID!,
    comments: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
    likes: process.env.NEXT_PUBLIC_APPWRITE_LIKES_COLLECTION_ID!,
  },
  buckets: {
    avatars: process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID!,
    posts: process.env.NEXT_PUBLIC_APPWRITE_POSTS_BUCKET_ID!,
  },
};
