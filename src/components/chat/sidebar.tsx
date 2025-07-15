import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreHorizontal, Search } from "lucide-react";
import type { Chat, User } from "@/types";
import { ContactList } from "./contact-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Users } from "lucide-react";
import { FriendList } from "./friend-list";
import { useAuth } from "@/context/auth-context";

interface SidebarProps {
  chats: Chat[];
  user: User;
  allUsers: User[];
}

export function Sidebar({ chats, user, allUsers }: SidebarProps) {
  const { logout } = useAuth();

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
          <Button variant="ghost" size="icon" onClick={() => logout()}>
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" />
        </div>
      </div>
      
      <Tabs defaultValue="chats" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-auto mt-2 max-w-[calc(100%-2rem)]">
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>
        <TabsContent value="chats" className="flex-1 flex flex-col">
           <ScrollArea className="flex-1">
            <ContactList chats={chats} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="calls" className="flex-1 flex flex-col items-center justify-center text-center p-4">
           <div className="p-4 bg-primary/10 rounded-full">
            <Phone className="w-10 h-10 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No Calls Yet</h3>
          <p className="text-sm text-muted-foreground">Your call history will appear here.</p>
        </TabsContent>
        <TabsContent value="friends" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1">
                <FriendList users={allUsers} />
            </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
