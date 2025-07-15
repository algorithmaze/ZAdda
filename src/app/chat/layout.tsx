"use client";

import { Sidebar } from "@/components/chat/sidebar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { User } from "@/types";
import { chats } from "@/lib/data"; // Keep this for now, will be replaced with Firestore data

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Loading...</p>
        </div>
    )
  }

  // Casting firebase user to our User type. In a real app you might fetch profile from firestore
  const loggedInUser: User = {
      id: user.uid,
      name: user.displayName || "User",
      email: user.email || "",
      avatar: user.photoURL || `https://placehold.co/100x100.png`,
      online: true,
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
