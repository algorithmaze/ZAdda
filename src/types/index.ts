
import type { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  online: boolean;
  lastSeen?: Timestamp;
  'data-ai-hint'?: string;
};

export type Message = {
  id: string;
  text: string;
  timestamp: Timestamp;
  senderId: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  'data-ai-hint'?: string;
  uploading?: boolean;
};

export type Chat = {
  id: string;
  userIds: string[];
  users: User[]; // This will be populated client-side
  otherUser?: User; // This will be populated client-side
  messages: Message[];
  unreadCount: number;
};

export type FriendRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
};
