"use client";
import { usePrompts } from "@/app/hooks/usePrompts";
import type React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
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
  const { refetchPrompts, addPrompt, prompts } = usePrompts(id);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(false);
  
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

    try {
      const tempPromptId = `temp-${Date.now()}`;
      const userPrompt: Prompt = {
        id: tempPromptId,
        value: promptToSend,
        type: "USER",
        createdAt: new Date().toISOString(),
        videoUrl: "",
      };
      
      addPrompt(userPrompt);

      const promptResponse = await axios.post(`/api/prompt`, {
        prompt: promptToSend,
        projectId: id,
        model: model || undefined,
      });
  
      const manimCode = promptResponse.data.code;
      const videoUrl = promptResponse.data.url;
      
      setVideoUrl(videoUrl);
      setTaskId(promptResponse.data.taskId);

      if (promptResponse.data.promptId) {
        await refetchPrompts();
        setSelectedChatId(promptResponse.data.promptId);
      }
  
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
      // Ensure we have the latest prompts regardless of success/failure
      refetchPrompts();
    }
  };

  const getVideoUrl = async () => {
    if (taskId !== "") {
      setLoadingVideo(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/task/${taskId}`);
        console.log(res.data.status);
        if (res.data.status === "failed"){
          setError(res.data.error);
          setLoadingVideo(false);
          return true;
        }
        if (res.data.error == null && res.data.result?.video_url) {
          setVideoUrl(res.data.result.video_url);
          setLoadingVideo(false);
          return true; 
        }
      } catch (error) {
        console.error("Error fetching video URL:", error);
        setLoadingVideo(false);
      }
      return false; 
    }
    return false;
  };

  // Poll the FAST API BE
  useEffect(() => {
    if (!taskId || videoUrl) return; 
    
    const interval = 5000;
    let timer: NodeJS.Timeout;
    
    const checkForVideo = async () => {
      const gotVideo = await getVideoUrl();
      if (gotVideo) {
        clearInterval(timer);
      }
    };

    checkForVideo();

    timer = setInterval(checkForVideo, interval);

    return () => {
      clearInterval(timer);
    };
  }, [taskId, videoUrl]);

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
          prompts={prompts}
          id={id}
          onChatSelect={handleChatClick}
          loading={loading}
          onSendPrompt={handleSendPrompt}
        />

        <div className="w-full flex rounded-3xl p-5">
          <div className="w-full flex flex-col bg-neutral-950 relative rounded-3xl py-3">
            <div className="flex-1 overflow-y-auto p-6 ">
              {loadingVideo && (
                <div className="flex items-center justify-center ">
                  <LLMResponseLoading />
                </div>
              )}

              {/* {error && <ChatErrorCard error={error} />} */}

              <div className="flex items-center justify-center min-h-[400px]">
                {videoUrl ? (
                  <VideoCard videoUrl={videoUrl} />
                ) : !loadingVideo && !error ? (
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