"use client";

import { Card } from "@/components/ui/card";

export const PromptLoadingSkeleton = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden animate-pulse">
        <div className="p-6 space-y-6">
         
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-slate-700/60"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-700/60 rounded"></div>
              <div className="h-3 w-24 bg-slate-700/60 rounded"></div>
            </div>
          </div>
          
          
          <div className="space-y-4">
            <div className="h-4 w-3/4 bg-slate-700/60 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-700/60 rounded"></div>
            <div className="h-4 w-2/3 bg-slate-700/60 rounded"></div>
            
           
            <div className="mt-4 rounded-md bg-slate-900/50 p-4 border border-slate-700/50">
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-700/60 rounded"></div>
                <div className="h-3 w-5/6 bg-slate-700/60 rounded"></div>
                <div className="h-3 w-3/4 bg-slate-700/60 rounded"></div>
                <div className="h-3 w-4/5 bg-slate-700/60 rounded"></div>
                <div className="h-3 w-2/3 bg-slate-700/60 rounded"></div>
              </div>
            </div>
            
            <div className="h-4 w-5/6 bg-slate-700/60 rounded"></div>
            <div className="h-4 w-4/5 bg-slate-700/60 rounded"></div>
          </div>
          
         
          <div className="mt-6">
            <div className="h-2 w-full bg-slate-700/30 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500/60 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="mt-2 flex justify-between">
              <div className="h-3 w-24 bg-slate-700/60 rounded"></div>
              <div className="h-3 w-16 bg-slate-700/60 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};