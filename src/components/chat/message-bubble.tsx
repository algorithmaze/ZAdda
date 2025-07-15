import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { File, Image as ImageIcon, Download } from "lucide-react";
import Image from "next/image";

interface MessageBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  message: Message;
  isSentByCurrentUser: boolean;
}

export function MessageBubble({ message, isSentByCurrentUser, className, ...props }: MessageBubbleProps) {
  const bubbleAlignment = isSentByCurrentUser ? "justify-end" : "justify-start";
  const bubbleClasses = isSentByCurrentUser
    ? "bg-primary text-primary-foreground"
    : "bg-muted";

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="p-2">
            <Image
              src={message.fileUrl || ''}
              alt="Shared image"
              width={300}
              height={200}
              className="rounded-lg object-cover"
              data-ai-hint={message['data-ai-hint']}
            />
            {message.text && <p className="mt-2 text-sm">{message.text}</p>}
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3">
             <File className="w-8 h-8 flex-shrink-0" />
             <div className="flex-1 overflow-hidden">
                <p className="font-medium truncate">{message.fileName}</p>
                <p className="text-xs">{message.text}</p>
             </div>
             <a href={message.fileUrl} download className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                <Download className="w-5 h-5"/>
             </a>
          </div>
        )
      case 'text':
      default:
        return <p className="p-3">{message.text}</p>;
    }
  }

  return (
    <div className={cn("flex", bubbleAlignment, className)} {...props}>
      <div
        className={cn(
          "max-w-xs md:max-w-md lg:max-w-lg rounded-2xl",
          bubbleClasses
        )}
      >
        {renderMessageContent()}
      </div>
    </div>
  );
}
