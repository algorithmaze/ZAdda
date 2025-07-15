import { Sidebar } from "@/components/chat/sidebar";
import { chats, loggedInUser } from "@/lib/data";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you would fetch this data from your backend/Firebase
  // and handle loading/error states.
  if (!loggedInUser) {
    // Or redirect to login, show a loading spinner, etc.
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Loading user data...</p>
        </div>
    )
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar chats={chats} user={loggedInUser} />
      <main className="flex-1 h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
