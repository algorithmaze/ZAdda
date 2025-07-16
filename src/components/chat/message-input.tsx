"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { db, storage } from "@/lib/firebase";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { arrayUnion, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";

interface MessageInputProps {
  chatId: string;
}

export function MessageInput({ chatId }: MessageInputProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const sendMessage = async (text: string, fileInfo?: { url: string, name: string, type: 'image' | 'file' }) => {
    if (!user) return;
    
    const chatRef = doc(db, "chats", chatId);
    const messageId = uuidv4();

    await updateDoc(chatRef, {
        messages: arrayUnion({
            id: messageId,
            text: text,
            senderId: user.uid,
            timestamp: serverTimestamp(),
            type: fileInfo ? fileInfo.type : 'text',
            fileUrl: fileInfo ? fileInfo.url : null,
            fileName: fileInfo ? fileInfo.name : null
        })
    });
  };
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user && !isUploading) {
      try {
        await sendMessage(message.trim());
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
        });
      }
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    
    try {
        const fileId = uuidv4();
        const filePath = `chats/${chatId}/${fileId}-${file.name}`;
        const fileStorageRef = storageRef(storage, filePath);
        
        await uploadBytes(fileStorageRef, file);
        const downloadURL = await getDownloadURL(fileStorageRef);
        
        const fileType = file.type.startsWith('image/') ? 'image' : 'file';

        await sendMessage(message.trim(), { url: downloadURL, name: file.name, type: fileType });
        
        setMessage("");
         if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }

    } catch (error) {
        console.error("Error uploading file:", error);
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Could not upload the file. Please try again.",
        });
    } finally {
        setIsUploading(false);
        // Reset file input
        if(e.target) e.target.value = '';
    }
  };
  
  return (
    <div className="p-4 border-t bg-card">
      <form onSubmit={handleSend} className="flex items-end gap-2">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isUploading} />
        <Button variant="ghost" size="icon" type="button" onClick={handleAttachmentClick} disabled={isUploading}>
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
          disabled={isUploading}
        />
        <Button type="submit" size="icon" className="rounded-full flex-shrink-0" disabled={isUploading || !message.trim()}>
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
