import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/types";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            isSentByCurrentUser={message.senderId === currentUserId}
            className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
        <TypingIndicator />
      </div>
    </ScrollArea>
  );
}
