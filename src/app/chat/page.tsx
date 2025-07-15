import { Logo } from "@/components/logo";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full text-center bg-card">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <div className="p-4 bg-primary/10 rounded-full">
            <MessageSquare className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mt-4">Welcome to ZAdda</h2>
        <p className="text-muted-foreground max-w-sm">
          Select a chat from the sidebar to start messaging. 
          Or, find a friend in the 'Friends' tab to start a new conversation.
        </p>
      </div>
    </div>
  );
}
