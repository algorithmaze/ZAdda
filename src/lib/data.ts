import type { User, Chat } from '@/types';
import { sub, formatDistanceToNow } from 'date-fns';

// This file will be used to fetch data from Firebase in the future.
// For now, it's cleared of static data.

export const users: User[] = [];

export const loggedInUser: User | null = null;


export const chats: Chat[] = [];

export const getChatById = (id: string): Chat | undefined => {
  return chats.find(chat => chat.id === id);
};
