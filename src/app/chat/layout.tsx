
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User, Chat } from "@/types";
import { collection, onSnapshot, query, where, getDoc, doc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sidebar } from "@/components/chat/sidebar";

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
  }, [user, authLoading, router]);

  if (authLoading || dataLoading || !user || !loggedInUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Loading your ZAdda experience...</p>
        </div>
    )
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar chats={chats} user={loggedInUser} allUsers={users} />
      <main className="flex-1 h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
