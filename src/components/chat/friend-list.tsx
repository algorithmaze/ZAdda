
"use client";

import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface FriendListProps {
    users: User[];
}

export function FriendList({ users }: FriendListProps) {
    const { user: loggedInUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const startChat = async (friend: User) => {
        if (!loggedInUser) return;
    
        const chatsRef = collection(db, "chats");
        // Check if a chat already exists between these two users
        const q = query(
          chatsRef,
          where("userIds", "array-contains", loggedInUser.uid)
        );
    
        const querySnapshot = await getDocs(q);
        const existingChat = querySnapshot.docs.find((doc) =>
          doc.data().userIds.includes(friend.id)
        );
    
        if (existingChat) {
          // If chat exists, navigate to it
          router.push(`/chat/${existingChat.id}`);
        } else {
          // If chat doesn't exist, create a new one
          try {
            const newChatRef = doc(collection(db, "chats"));
            await setDoc(newChatRef, {
                id: newChatRef.id,
                userIds: [loggedInUser.uid, friend.id],
                messages: [],
                unreadCount: 0,
                createdAt: serverTimestamp(),
            });
            router.push(`/chat/${newChatRef.id}`);
          } catch(error) {
              console.error("Error starting new chat: ", error);
              toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Could not start a new chat. Please try again."
              })
          }
        }
      };

    if (users.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                No other users found.
            </div>
        );
    }
    
    return (
        <div className="p-2 space-y-1">
            {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-primary/5">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                         <div className="flex-1 overflow-hidden">
                            <h4 className="font-semibold truncate">{user.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => startChat(user)}>
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>
            ))}
        </div>
    )
}
