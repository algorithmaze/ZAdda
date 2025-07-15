export function TypingIndicator() {
  // In a real app, you would conditionally render this based on typing status
  // For this UI-only scaffold, we can show it for demonstration.
  // To make it less intrusive, let's keep it commented out by default in MessageList
  // and just create the component here.
  
  return (
    <div className="flex justify-start">
      <div className="flex items-center space-x-1 bg-muted px-3 py-2 rounded-2xl">
        <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce" />
      </div>
    </div>
  );
}
