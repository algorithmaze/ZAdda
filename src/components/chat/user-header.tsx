
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search } from "lucide-react";
import type { User } from "@/types";
import { useAuth } from "@/context/auth-context";
import { Input } from "../ui/input";

interface UserHeaderProps {
  user: User;
}

export function UserHeader({ user }: UserHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="p-4 border-b bg-card sticky top-0 z-10">
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
    </header>
  );
}
