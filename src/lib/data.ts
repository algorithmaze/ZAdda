import type { User, Chat } from '@/types';

// This file will be used to fetch data from Firebase in the future.
// For now, it's cleared of static data.

export const users: User[] = [];

export const loggedInUser: User | null = null;


export const chats: Chat[] = [];

export const getChatById = (id: string): Chat | undefined => {
  // This is a placeholder. In a real app, this would fetch from Firestore.
  // We return undefined because the static data is gone.
  // The UI will show "Loading..." until we implement Firestore fetching.
  return undefined;
};
