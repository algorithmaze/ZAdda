import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import type { Chat, User } from "@/types";
import { ContactList } from "./contact-list";

interface SidebarProps {
  chats: Chat[];
  user: User;
}

export function Sidebar({ chats, user }: SidebarProps) {
  return (
    <aside className="w-full max-w-xs h-full flex flex-col glassmorphism m-2 rounded-2xl">
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="font-semibold text-lg">{user.name}</h2>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search or start new chat" className="pl-9" />
        </div>
      </div>
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <h3 className="text-xl font-semibold tracking-tight">Chats</h3>
        <Button variant="ghost" size="icon">
          <Plus className="w-5 h-5" />
          <span className="sr-only">New Chat</span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <ContactList chats={chats} />
      </ScrollArea>
    </aside>
  );
}
