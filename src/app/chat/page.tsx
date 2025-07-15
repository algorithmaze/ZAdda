
"use client"
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/logo";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center h-full text-center bg-card">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <h2 className="text-2xl font-semibold mt-4">Welcome to ZAdda</h2>
        <p className="text-muted-foreground max-w-sm">
          Select a chat from the list to start messaging or find a friend to connect with.
        </p>
      </div>
    </div>
  );
}
