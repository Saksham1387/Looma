export function ChatLoading() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="group transition-all duration-300">
          <div className="flex items-start gap-4 p-4">
            <div className="w-8 h-8 rounded-full bg-neutral-950 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="h-4 w-24 bg-neutral-950 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-neutral-950 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-neutral-950 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
