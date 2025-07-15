
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User, Chat } from "@/types";
import { collection, onSnapshot, query, where, getDoc, doc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BottomNavbar } from "@/components/chat/bottom-navbar";
import { UserHeader } from "@/components/chat/user-header";
import { ContactList } from "@/components/chat/contact-list";
import { FriendList } from "@/components/chat/friend-list";
import { Phone } from "lucide-react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chats");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setLoggedInUser({ id: doc.id, ...doc.data() } as User);
        } else {
          router.push('/'); 
        }
      });

      const chatsQuery = query(collection(db, "chats"), where("userIds", "array-contains", user.uid));
      const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
        const chatsData = await Promise.all(snapshot.docs.map(async (doc) => {
          const chat = { id: doc.id, ...doc.data() } as Chat;
          const otherUserId = chat.userIds.find(uid => uid !== user.uid);
          if (otherUserId) {
            const userDocRef = doc(db, 'users', otherUserId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              chat.otherUser = { id: userDoc.id, ...userDoc.data() } as User;
            }
          }
          return chat;
        }));
        
        setChats(chatsData);
        if(dataLoading) setDataLoading(false);
      }, (error) => {
        console.error("Error fetching chats: ", error);
        if(dataLoading) setDataLoading(false);
      });
      
      const usersQuery = query(collection(db, "users"), where("id", "!=", user.uid));
      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
      });

      return () => {
        unsubscribeUser();
        unsubscribeChats();
        unsubscribeUsers();
      };
    } else {
       if (!authLoading) {
         setDataLoading(false);
       }
    }
  }, [user, authLoading, router, dataLoading]);
  
  const renderContent = () => {
    switch (activeTab) {
      case "chats":
        return <ContactList chats={chats} />;
      case "friends":
        return <FriendList users={users} />;
      case "calls":
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Phone className="w-10 h-10 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No Calls Yet</h3>
            <p className="text-sm text-muted-foreground">Your call history will appear here.</p>
          </div>
        );
      default:
        return children;
    }
  }

  const isChatConversationPage = router.pathname?.includes('/chat/') && router.pathname.length > '/chat/'.length;

  if (authLoading || dataLoading || !user || !loggedInUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Loading your ZAdda experience...</p>
        </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background md:bg-card">
      <div className={`flex-1 flex flex-col h-full ${isChatConversationPage ? '' : 'md:max-w-sm md:mx-auto md:border-x'}`}>
        {!isChatConversationPage && <UserHeader user={loggedInUser} />}
        <main className="flex-1 h-full flex flex-col overflow-y-auto">
          {isChatConversationPage ? children : renderContent()}
        </main>
        {!isChatConversationPage && <BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />}
      </div>
       {isChatConversationPage && (
        <div className="hidden md:flex flex-1 flex-col">
          {children}
        </div>
      )}
    </div>
  );
}
