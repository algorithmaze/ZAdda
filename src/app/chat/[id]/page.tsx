"use client"
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { getChatById } from "@/lib/data";
import { useEffect, useState } from "react";
import type { Chat } from "@/types";
import { useAuth } from "@/context/auth-context";

export default function ChatConversationPage({ params }: { params: { id: string } }) {
  const { user: loggedInUser } = useAuth();
  const [chat, setChat] = useState<Chat | undefined>(undefined);

  useEffect(() => {
    // Simulating a fetch. Will be replaced with firestore fetch.
    const fetchedChat = getChatById(params.id);
    setChat(fetchedChat);
  }, [params.id]);


  if (!chat || !loggedInUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  const otherUser = chat.users.find(u => u.id !== loggedInUser.uid);

  if (!otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Chat participant not found.</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col h-full bg-card">
      <ChatHeader user={otherUser} />
      <MessageList messages={chat.messages} currentUserId={loggedInUser.uid} />
      <MessageInput />
    </div>
  );
}
