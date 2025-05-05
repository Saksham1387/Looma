import { Loader2 } from "lucide-react";

export function ChatLoading() {
  return (
    <div className="flex items-start gap-4 p-4 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
        <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">System</span>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
} 