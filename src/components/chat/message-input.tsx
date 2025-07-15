"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from "lucide-react";
import React from "react";

export function MessageInput() {
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
  
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
       if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
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
