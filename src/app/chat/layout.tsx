import { Sidebar } from "@/components/chat/sidebar";
import { chats, loggedInUser } from "@/lib/data";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full">
      <Sidebar chats={chats} user={loggedInUser} />
      <main className="flex-1 h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
