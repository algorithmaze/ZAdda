"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { Paperclip, Send } from "lucide-react";
import { arrayUnion, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface MessageInputProps {
  chatId: string;
}

export function MessageInput({ chatId }: MessageInputProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      const chatRef = doc(db, "chats", chatId);
      try {
        await updateDoc(chatRef, {
          messages: arrayUnion({
            id: uuidv4(),
            text: message.trim(),
            senderId: user.uid,
            timestamp: serverTimestamp(),
            type: 'text'
          })
        });

        setMessage("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      } catch (error) {
        console.error("Error sending message: ", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not send your message. Please try again."
        })
      }
    }
  };
  
  return (
    <div className="p-4 border-t bg-card">
      <form onSubmit={handleSend} className="flex items-end gap-2">
        <Button variant="ghost" size="icon" type="button">
          <Paperclip className="w-5 h-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 resize-none max-h-40 min-h-[40px] rounded-2xl"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <Button type="submit" size="icon" className="rounded-full flex-shrink-0">
          <Send className="w-5 h-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
