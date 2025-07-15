"use client"
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import type { Chat, User as UserType } from "@/types";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function ChatConversationPage({ params }: { params: { id: string } }) {
  const { user: loggedInUser } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (!loggedInUser) return;

    const chatDocRef = doc(db, "chats", params.id);

    const unsubscribe = onSnapshot(chatDocRef, async (doc) => {
      if (doc.exists()) {
        const chatData = { id: doc.id, ...doc.data() } as Chat;
        
        // Fetch user details for the other participant
        const otherUserId = chatData.userIds.find(uid => uid !== loggedInUser.uid);
        if (otherUserId) {
          const userDocRef = doc(db, 'users', otherUserId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserType;
            setOtherUser(userData);
          }
        }
        
        chatData.messages.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
        setChat(chatData);

      } else {
        console.error("Chat not found!");
        setChat(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.id, loggedInUser]);


  if (loading || !loggedInUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  if (!chat || !otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Chat not found or participant details could not be loaded.</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col h-full bg-card">
      <ChatHeader user={otherUser} />
      <MessageList messages={chat.messages} currentUserId={loggedInUser.uid} />
      <MessageInput chatId={chat.id} />
    </div>
  );
}
