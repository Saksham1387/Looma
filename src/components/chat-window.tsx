"use client";
import { usePrompts } from "@/app/hooks/usePrompts";
import type React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { ChatErrorCard } from "./chat-error-card";
import { LLMResponseLoading } from "./llm-response-loading";
import { VideoCard } from "./video-card";
import { ChatHeader } from "./chat-header";
import { ChatLayoutCard } from "./chat-layout-card";
import { Prompt } from "@/app/hooks/usePrompts";
import { ChatHistory } from "./chat-history";

type Props = {
  id: string;
};

type ErrorResponse = {
  error: string;
  details?: string;
};

const Chatpage = ({ id }: Props) => {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const { refetchPrompts, addPrompt } = usePrompts(id);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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

  const handleSendPrompt = async (
    promptValue?: string,
    model?: string | null
  ) => {
    const promptToSend = promptValue;
    if (!promptToSend?.trim()) return;

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

      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data;

        if (typeof errorData === "object" && errorData.error) {
          setError(errorData as ErrorResponse);
        } else {
          setError({
            error:
              errorData.error || "Failed to process prompt or generate video",
          });
        }
      } else {
        setError({
          error: "An unexpected error occurred",
        });
      }
    } finally {
      setLoading(false);
      refetchPrompts();
    }
  };

  const handleChatClick = (promptId: string, promptVideoUrl: string) => {
    setSelectedChatId(promptId);
    setVideoUrl(promptVideoUrl);
    refetchPrompts();
  };

  return (
    <div className="bg-[#0f0f0f] text-slate-200 flex flex-col h-screen overflow-hidden">
      <ChatHeader />
      <div className="flex flex-1 overflow-hidden ">
        <ChatHistory
          id={id}
          onChatSelect={handleChatClick}
          loading={loading}
          onSendPrompt={handleSendPrompt}
        />

        <div className="w-full flex rounded-3xl p-5">
          <div className="w-full flex flex-col bg-neutral-950 relative rounded-3xl py-3">
            <div className="flex-1 overflow-y-auto p-6 ">
              {loading && (
                <div className="flex items-center justify-center ">
                  <LLMResponseLoading />
                </div>
              )}

              {error && <ChatErrorCard error={error} />}

              <div className="flex items-center justify-center min-h-[400px]">
                {videoUrl ? (
                  <VideoCard videoUrl={videoUrl} />
                ) : !loading && !error ? (
                  <div>
                  <ChatLayoutCard />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* TODO: Can be a better way to do this */}
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
