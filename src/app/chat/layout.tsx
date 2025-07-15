"use client";

import { Sidebar } from "@/components/chat/sidebar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User, Chat } from "@/types";
import { collection, onSnapshot, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if(doc.exists()){
            setLoggedInUser({ id: doc.id, ...doc.data() } as User);
        }
      });

      const chatsQuery = query(collection(db, "chats"), where("userIds", "array-contains", user.uid));
      
      const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
        const chatsData = await Promise.all(snapshot.docs.map(async (doc) => {
          const chat = { id: doc.id, ...doc.data() } as Chat;

          // Fetch other user's data
          const otherUserId = chat.userIds.find(uid => uid !== user.uid);
          if (otherUserId) {
            const userDocRef = doc(db, 'users', otherUserId);
            const userDoc = await getDoc(userDocRef);
            if(userDoc.exists()) {
                chat.otherUser = { id: userDoc.id, ...userDoc.data() } as User;
            }
          }
          
          return chat;
        }));
        
        setChats(chatsData);
        setDataLoading(false);
      });

      return () => {
          unsubscribeUser();
          unsubscribeChats();
      };
    }
  }, [user]);

  if (loading || dataLoading || !user || !loggedInUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Loading your ZAdda experience...</p>
        </div>
    )
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar chats={chats} user={loggedInUser} />
      <main className="flex-1 h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
