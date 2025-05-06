"use client";
import { usePrompts } from "@/app/hooks/usePrompts";
import type React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import { Send, Loader2, Film, Info, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ChatErrorCard } from "./chat-error-card";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { LLMResponseLoading } from "./llm-response-loading";
import { VideoCard } from "./video-card";
import { ChatHeader } from "./chat-header";
import { SystemResponse } from "./system-response";
import { ChatLayoutCard } from "./chat-layout-card";
import { Prompt } from "@/app/hooks/usePrompts";
import { ChatLoading } from "./chat-loading";

type Props = {
  id: string;
};

const Chatpage = ({ id }: Props) => {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null | any>(null);
  const { prompts, refetchPrompts, addPrompt, isLoading: isPromptsLoading } = usePrompts(id);
  const [input, setInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { data: session } = useSession();
  const [expandedCodeMap, setExpandedCodeMap] = useState<
    Record<string, boolean>
  >({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const promptFromUrl = urlParams.get("prompt");
    const modelFromUrl = urlParams.get("model");

    if (promptFromUrl) {
      setInput(promptFromUrl);
      handleSendPrompt(promptFromUrl, modelFromUrl);

      // Remove prompt and model from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (loading) {
      setProgress(0);

      interval = setInterval(() => {
        setProgress((prev) => {
          const increment = prev < 30 ? 10 : prev < 60 ? 5 : prev < 80 ? 2 : 1;
          const newProgress = Math.min(prev + increment, 90);
          return newProgress;
        });
      }, 500);
    } else if (progress > 0 && progress < 100) {
      setProgress(100);

      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, progress]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isBottom = scrollHeight - scrollTop <= clientHeight + 100;
      setIsAtBottom(isBottom);
    }
  };

  useEffect(() => {
    if (scrollRef.current && isAtBottom) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [prompts, loading, isAtBottom]);

  const handleSendPrompt = async (promptValue?: string, model?: string | null) => {
    const promptToSend = promptValue || input;
    if (!promptToSend.trim()) return;

    setLoading(true);
    setError(null);
    setVideoUrl(null);

    const userPrompt: Prompt = {
      id: Date.now().toString(),
      value: promptToSend,
      type: "USER",
      createdAt: new Date().toISOString(),
      videoUrl: "",
    };
    addPrompt(userPrompt);

    try {
      const promptResponse = await axios.post(`/api/prompt`, {
        prompt: promptToSend,
        projectId: id,
        model: model || undefined,
      });

      const manimCode = promptResponse.data.code;
      setVideoUrl(promptResponse.data.url);

      const systemPrompt: Prompt = {
        id: (Date.now() + 1).toString(),
        value: promptResponse.data.response || "Processing your request...",
        type: "SYSTEM",
        createdAt: new Date().toISOString(),
        videoUrl: promptResponse.data.url || "",
      };
      addPrompt(systemPrompt);

      if (!manimCode) {
        throw new Error("No Manim code returned from /api/prompt");
      }
    } catch (err) {
      console.error("Error:", err);

      // Handle detailed error information
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data;

        // Check if we have a detailed error object
        if (typeof errorData === 'object' && errorData.error) {
          setError(errorData);
        } else {
          setError(errorData.error || "Failed to process prompt or generate video");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
      setInput("");

      refetchPrompts();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleSendPrompt();
    }
  };

  const handleChatClick = (promptId: string, promptVideoUrl: string) => {
    setSelectedChatId(promptId);
    setVideoUrl(promptVideoUrl);
    refetchPrompts();
  };

  return (
    <div className="bg-gray-950 text-slate-200 flex flex-col h-screen overflow-hidden">
      <ChatHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Chat history */}
        <div className="w-2/5 border-r border-slate-800 flex flex-col bg-gray-950">
          <div className="flex-1 overflow-hidden">
            <ScrollArea
              className="h-full"
              ref={scrollRef}
              onScroll={handleScroll}
            >
              <div className="p-3">
                {isPromptsLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="group transition-all duration-300">
                        <div className="flex items-start gap-4 p-4">
                          <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 w-full bg-slate-700 rounded animate-pulse" />
                              <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : prompts && prompts.length > 0 ? (
                  <div className="space-y-6">
                    {prompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className={`group transition-all duration-300 ${
                          selectedChatId === prompt.id
                            ? "bg-slate-800/50"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-4 p-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}
                          >
                            {prompt.type === "USER" ? (
                              <Image
                                src={session?.user?.image || ""}
                                alt="User"
                                width={32}
                                height={32}
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                <Film />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-500">
                                {new Date(prompt.createdAt).toLocaleString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                              {prompt.type != "USER" && prompt.videoUrl && (
                                <button
                                  onClick={() =>
                                    handleChatClick(prompt.id, prompt.videoUrl)
                                  }
                                  className={`h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${
                                    selectedChatId === prompt.id
                                      ? "text-slate-400 opacity-100"
                                      : "text-slate-600 hover:text-slate-400"
                                  }`}
                                >
                                  <ChevronRight size={14} />
                                </button>
                              )}
                            </div>
                            <div className="prose prose-invert max-w-none">
                              {prompt.type === "USER" ? (
                                <div className="text-slate-200">
                                  {prompt.value}
                                </div>
                              ) : (
                                <div className="text-slate-300 space-y-4">
                                  <SystemResponse
                                    content={prompt.value}
                                    promptId={prompt.id}
                                    expandedCodeMap={expandedCodeMap}
                                    setExpandedCodeMap={setExpandedCodeMap}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && <ChatLoading />}
                  </div>
                ) : (
                  <Card className="bg-slate-800 border-slate-700 animate-fade-in">
                    <CardContent className="p-6 text-center">
                      <Info size={24} className="mx-auto mb-3 text-slate-500" />
                      <p className="text-slate-400 text-sm">
                        No chat history yet
                      </p>
                      <p className="text-slate-500 text-xs mt-2">
                        Your conversation history will appear here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
            {/* Scroll to bottom button */}
            {!isAtBottom && (
              <button
                onClick={() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({
                      top: scrollRef.current.scrollHeight,
                      behavior: "smooth",
                    });
                  }
                }}
                className="absolute bottom-24 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors shadow-lg"
              >
                <ChevronRight className="h-4 w-4 rotate-90" />
              </button>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0">
            <div className="flex flex-row gap-2 items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your math animation prompt..."
                disabled={loading}
                className="flex-1 bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-slate-500 focus-visible:ring-offset-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:border-slate-600"
              />
              <Button
                onClick={() => handleSendPrompt()}
                disabled={loading || !input.trim()}
                size="icon"
                variant="default"
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all duration-200 hover:scale-105"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Video display */}
        <div className="w-3/5 flex flex-col bg-gray-950 relative">
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center ">
                <LLMResponseLoading />
              </div>
            )}

            {error && <ChatErrorCard error={error} />}

            {/* Video player or placeholder */}
            <div className="flex items-center justify-center min-h-[400px]">
              {videoUrl ? (
                <VideoCard videoUrl={videoUrl} />
              ) : !loading && !error ? (
                <ChatLayoutCard />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Chatpage;
