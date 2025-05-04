"use client";
import { usePrompts } from "@/app/hooks/usePrompts";
import type React from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import {
  Send,
  Loader2,
  Film,
  MessageSquare,
  Info,
  AlertCircle,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  id: string;
};

const Chatpage = ({ id }: Props) => {
  const [loading, setLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { prompts } = usePrompts(id);
  const [input, setInput] = useState("");
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

  const handleSendPrompt = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      setProcessingStage("Sending prompt to AI...");
      setProcessingStage("Processing video...");

      const promptResponse = await axios.post(`/api/prompt`, {
        prompt: input,
        projectId: id,
      });

      const manimCode = promptResponse.data.code;
      setVideoUrl(promptResponse.data.url);
      if (!manimCode) {
        throw new Error("No Manim code returned from /api/prompt");
      }

      setProcessingStage("Generating animation with Manim...");

      setProcessingStage("Video ready!");

      setTimeout(() => {
        setProcessingStage(null);
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setError(
        axios.isAxiosError(err) && err.response
          ? err.response.data.error ||
              "Failed to process prompt or generate video"
          : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleSendPrompt();
    }
  };

  return (
    <div className="bg-black text-slate-200 flex h-screen overflow-hidden">
      {/* Left sidebar - Chat history */}
      <div className="w-1/4 border-r border-slate-800 h-screen flex flex-col bg-black">
        <div className="p-4 font-bold border-b border-black bg-gray-900 flex items-center gap-2">
          <MessageSquare size={18} className="text-slate-400" />
          <span className="text-slate-200">Chat History</span>
        </div>

        <ScrollArea className="flex-1 p-3">
          {prompts && prompts.length > 0 ? (
            <div className="space-y-2">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="bg-gray-800 p-3 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer text-sm group"
                >
                  <button
                    onClick={() => {
                      setVideoUrl(prompt.videoUrl);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 text-slate-300">
                        {prompt.value}
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="flex items-center mt-2 text-xs text-slate-500">
                      <Clock size={12} className="mr-1" />
                      <span>Just now</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 text-center">
                <Info size={24} className="mx-auto mb-3 text-slate-500" />
                <p className="text-slate-400 text-sm">No chat history yet</p>
                <p className="text-slate-500 text-xs mt-2">
                  Your conversation history will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex flex-row gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your math animation prompt..."
              disabled={loading}
              className="flex-1 bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-slate-500 focus-visible:ring-offset-slate-900 placeholder:text-slate-500"
            />
            <Button
              onClick={handleSendPrompt}
              disabled={loading || !input.trim()}
              size="icon"
              variant="default"
              className="bg-slate-700 hover:bg-slate-600 text-slate-200"
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
      <div className="w-3/4 flex flex-col bg-black relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
                <Film className="text-slate-400" />
                <span>Looma Animation Generator</span>
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Visualize mathematical concepts through beautiful animations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-full text-xs text-slate-300">
                <Sparkles size={12} className="text-slate-400" />
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading indicator */}
          {loading && (
            <Card className="mb-6 bg-slate-900 border-slate-800">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin text-slate-400" size={24} />
                  <span className="font-medium text-slate-300">
                    {processingStage || "Processing..."}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-slate-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error display */}
          {error && (
            <Card className="mb-6 bg-red-900/20 border-red-800/50">
              <CardContent className="p-6 flex items-start gap-3">
                <AlertCircle
                  className="text-red-400 mt-1 flex-shrink-0"
                  size={20}
                />
                <div>
                  <strong className="font-bold text-red-300">Error: </strong>
                  <span className="block mt-1 text-red-200">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video player or placeholder */}
          <div className="flex items-center justify-center min-h-[400px]">
            {videoUrl ? (
              <div className="w-full max-w-4xl">
                <Card className="overflow-hidden bg-black border-slate-800 shadow-xl shadow-slate-900/50">
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900/80 to-transparent p-3 z-10">
                      <div className="text-xs text-slate-300 flex items-center gap-1">
                        <Film size={12} className="text-slate-400" />
                        Looma Animation
                      </div>
                    </div>
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      className="w-full aspect-video object-contain bg-black"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-300">
                        Generated Animation
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                        >
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                        >
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : !loading && !error ? (
              <Card className="bg-black border-slate-800 max-w-lg w-full shadow-lg">
                <CardContent className="p-8 text-center">
                  <Film
                    size={48}
                    className="mx-auto mb-4 text-slate-400 opacity-80"
                  />
                  <h3 className="text-2xl font-bold mb-2 text-slate-200">
                    Looma Animation Generator
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Enter a prompt to generate a mathematical animation video
                  </p>
                  <Separator className="my-6 bg-slate-800" />
                  <div className="text-sm text-slate-500 p-4 bg-slate-800/50 rounded-lg">
                    <p className="mb-2 text-slate-400 font-medium">
                      Example prompts:
                    </p>
                    <ul className="space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-slate-500" />
                        "Show the proof of the Pythagorean theorem visually"
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-slate-500" />
                        "Animate the concept of limits in calculus"
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-slate-500" />
                        "Visualize the unit circle and trigonometric functions"
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatpage;
