"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Chat } from "@/types";
import { useAuth } from "@/context/auth-context";


interface ContactListProps {
  chats: Chat[];
}

export function ContactList({ chats }: ContactListProps) {
  const pathname = usePathname();
  const { user: loggedInUser } = useAuth();


  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No chats found.
      </div>
    );
  }

  return (
    <nav className="p-2 space-y-1">
      {chats.map((chat) => {
        const otherUser = chat.users.find((u) => u.id !== loggedInUser?.uid);
        const isActive = pathname === `/chat/${chat.id}`;
        if (!otherUser) return null;

        const lastMessage = chat.messages[chat.messages.length - 1];

        return (
          <Link
            href={`/chat/${chat.id}`}
            key={chat.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-primary/5",
              isActive && "bg-primary/10"
            )}
          >
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {otherUser.online && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="font-semibold truncate">{otherUser.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{lastMessage?.text || "No messages yet"}</p>
            </div>
            <div className="flex flex-col items-end text-xs text-muted-foreground space-y-1">
              <span>{lastMessage?.timestamp}</span>
              {chat.unreadCount > 0 && (
                <Badge variant="default" className="w-5 h-5 flex items-center justify-center p-0">
                  {chat.unreadCount}
                </Badge>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
