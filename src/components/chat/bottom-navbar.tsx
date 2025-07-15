
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, Phone, Users } from "lucide-react";

interface BottomNavbarProps {
    activeTab: string;
    onTabChange: (tab: "chats" | "calls" | "friends") => void;
}

export function BottomNavbar({ activeTab, onTabChange }: BottomNavbarProps) {
    const navItems = [
        { name: "chats", icon: MessageCircle, label: "Chats" },
        { name: "calls", icon: Phone, label: "Calls" },
        { name: "friends", icon: Users, label: "Friends" },
    ] as const;

    return (
        <div className="flex items-center justify-around p-2 border-t bg-card sticky bottom-0 z-10">
            {navItems.map((item) => (
                <Button
                    key={item.name}
                    variant="ghost"
                    className={cn(
                        "flex flex-col h-auto items-center gap-1 text-muted-foreground",
                        activeTab === item.name && "text-primary"
                    )}
                    onClick={() => onTabChange(item.name)}
                >
                    <item.icon className="w-6 h-6" />
                    <span className="text-xs">{item.label}</span>
                </Button>
            ))}
        </div>
    )
}
