import { ChatHeader } from "@/components/chat/chat-header";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { getChatById, loggedInUser } from "@/lib/data";

export default function ChatConversationPage({ params }: { params: { id: string } }) {
  const chat = getChatById(params.id);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Chat not found.</p>
      </div>
    );
  }

  const otherUser = chat.users.find(u => u.id !== loggedInUser.id);

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
      <MessageList messages={chat.messages} currentUserId={loggedInUser.id} />
      <MessageInput />
    </div>
  );
}
