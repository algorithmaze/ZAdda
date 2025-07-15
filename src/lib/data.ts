import type { User, Chat } from '@/types';
import { sub, formatDistanceToNow } from 'date-fns';

export const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', avatar: 'https://placehold.co/100x100.png', online: true, "data-ai-hint": "woman portrait" },
  { id: '2', name: 'Bob', email: 'bob@example.com', avatar: 'https://placehold.co/100x100.png', online: false, lastSeen: '2 hours ago', "data-ai-hint": "man portrait" },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', avatar: 'https://placehold.co/100x100.png', online: true, "data-ai-hint": "person portrait" },
  { id: '4', name: 'Diana', email: 'diana@example.com', avatar: 'https://placehold.co/100x100.png', online: false, lastSeen: 'yesterday', "data-ai-hint": "woman face" },
  { id: '5', name: 'Ethan', email: 'ethan@example.com', avatar: 'https://placehold.co/100x100.png', online: true, "data-ai-hint": "man face" },
  { id: '6', name: 'Fiona', email: 'fiona@example.com', avatar: 'https://placehold.co/100x100.png', online: false, lastSeen: '3 days ago', "data-ai-hint": "woman smiling" },
];

export const loggedInUser: User = {
  id: '0',
  name: 'You',
  email: 'you@example.com',
  avatar: 'https://placehold.co/100x100.png',
  online: true,
  "data-ai-hint": "user profile"
};

const generateMessages = (userId1: string, userId2: string) => [
  { id: 'msg1', text: 'Hey, how are you?', timestamp: formatDistanceToNow(sub(new Date(), { minutes: 10 })), senderId: userId1, type: 'text' as const },
  { id: 'msg2', text: 'I am good, thanks! How about you?', timestamp: formatDistanceToNow(sub(new Date(), { minutes: 9 })), senderId: userId2, type: 'text' as const },
  { id: 'msg3', text: 'Doing great. Just working on the new project.', timestamp: formatDistanceToNow(sub(new Date(), { minutes: 8 })), senderId: userId1, type: 'text' as const },
  { id: 'msg4', text: 'Sounds exciting!', timestamp: formatDistanceToNow(sub(new Date(), { minutes: 7 })), senderId: userId2, type: 'text' as const },
  { id: 'msg5', text: 'Check out this design file.', timestamp: formatDistanceToNow(sub(new Date(), { minutes: 6 })), senderId: userId1, type: 'file' as const, fileName: 'design_mockup.fig', fileUrl: '#' },
  { id: 'msg6', text: 'Looks awesome!', timestamp: formatDistanceToNow(sub(new Date(), { minutes: 5 })), senderId: userId2, type: 'text' as const },
  { id: 'msg7', text: 'And this is a preview image.', timestamp: formatDistanceToNow(sub(new Date(), { minutes: 4 })), senderId: userId1, type: 'image' as const, fileUrl: 'https://placehold.co/600x400.png', "data-ai-hint": "abstract design" },
];

export const chats: Chat[] = [
  {
    id: 'chat1',
    users: [loggedInUser, users[0]],
    messages: generateMessages(loggedInUser.id, users[0].id),
    unreadCount: 2,
  },
  {
    id: 'chat2',
    users: [loggedInUser, users[1]],
    messages: [
        { id: 'msg1', text: 'Lunch tomorrow?', timestamp: formatDistanceToNow(sub(new Date(), { hours: 1 })), senderId: users[1].id, type: 'text' },
        { id: 'msg2', text: 'Sure, what time?', timestamp: formatDistanceToNow(sub(new Date(), { minutes: 59 })), senderId: loggedInUser.id, type: 'text' },
    ],
    unreadCount: 0,
  },
  {
    id: 'chat3',
    users: [loggedInUser, users[2]],
    messages: [
        { id: 'msg1', text: 'Can you review my code?', timestamp: formatDistanceToNow(sub(new Date(), { hours: 5 })), senderId: users[2].id, type: 'text' },
    ],
    unreadCount: 1,
  },
  {
    id: 'chat4',
    users: [loggedInUser, users[3]],
    messages: [
        { id: 'msg1', text: 'Happy Birthday!', timestamp: formatDistanceToNow(sub(new Date(), { days: 1 })), senderId: loggedInUser.id, type: 'text' },
    ],
    unreadCount: 0,
  },
    {
    id: 'chat5',
    users: [loggedInUser, users[4]],
    messages: [
        { id: 'msg1', text: 'See you at the meeting.', timestamp: formatDistanceToNow(sub(new Date(), { minutes: 30 })), senderId: users[4].id, type: 'text' },
    ],
    unreadCount: 0,
  },
];

export const getChatById = (id: string) => {
  return chats.find(chat => chat.id === id);
};
