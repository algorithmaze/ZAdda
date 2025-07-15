
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNowStrict } from "date-fns";
import { Phone, Video } from "lucide-react";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  user: User;
  isMobile?: boolean;
}

export function ChatHeader({ user, isMobile = false }: ChatHeaderProps) {
  const getLastSeen = () => {
    if(!user.lastSeen) return "a long time ago";
    return formatDistanceToNowStrict(user.lastSeen.toDate(), { addSuffix: true })
  }
  return (
    <div className={cn("flex items-center justify-between", !isMobile && "p-4 border-b bg-card")}>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg">{user.name}</h3>
          <p className="text-sm text-muted-foreground">
            {user.online ? "Online" : `Last seen ${getLastSeen()}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Phone className="w-5 h-5" />
          <span className="sr-only">Voice call</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="w-5 h-5" />
          <span className="sr-only">Video call</span>
        </Button>
      </div>
    </div>
  );
}
