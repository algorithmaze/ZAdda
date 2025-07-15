export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
  'data-ai-hint'?: string;
};

export type Message = {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  'data-ai-hint'?: string;
};

export type Chat = {
  id: string;
  users: User[];
  messages: Message[];
  unreadCount: number;
};
