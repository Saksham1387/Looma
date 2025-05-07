"use client";
import { useState, useEffect, useRef } from "react";
import type React from "react";
import { Send, Check, Package, ChevronDown } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export const LandingTextBox = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(true);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [selectedModel, setSelectedModel] = useState("OpenAI");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {data:session}  = useSession();

  const placeholders = [
    "Create a smooth character walk cycle animation...",
    "Animate a typewriter text effect with blinking cursor...",
    "Make a pulsing loading spinner with glowing edges...",
    "Design an interactive particle burst animation for my header...",
    "Animate a cinematic logo reveal with fade and zoom effects...",
  ];

  useEffect(() => {
    let currentIndex = 0;
    setCurrentPlaceholder(placeholders[currentIndex]);

    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % placeholders.length;
        setCurrentPlaceholder(placeholders[currentIndex]);
        setVisible(true);
      }, 800);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if(!session){
      toast.error("Please Login to use Looma");
      return;
    }
    e.preventDefault();
    try {
      const res = await axios.post("/api/project", {
        prompt: input,
        model: selectedModel,
      });
      const id = res.data.project.id;
      router.push(
        `/chat/${id}?prompt=${encodeURIComponent(input)}&model=${selectedModel}`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project. Please try again.");
    }
  };

  return (
    <div className="w-full rounded-lg bg-[#111111] border border-[#222222] p-2 flex flex-col">
      <form onSubmit={handleSubmit} className="w-full flex flex-col relative">
        <div className="flex flex-row relative w-full">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="bg-transparent text-white w-full outline-none resize-none text-base h-24 relative z-10 p-2 placeholder-gray-500 focus:ring-0 border-0"
            placeholder=""
          />

          {!input && (
            <div
              className="absolute left-2 top-4 pointer-events-none text-gray-500 text-base"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.8s ease, transform 0.8s ease",
              }}
            >
              {currentPlaceholder}
            </div>
          )}

          {/* Send button in right corner */}
          <div className="absolute right-4 top-2 z-20">
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="text-white hover:text-teal-400 hover:bg-transparent"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>

      {/* Custom model selection dropdown at bottom */}
      <div className="flex justify-start mt-2 border-t border-[#222222] pt-2">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-300 px-2 py-1 rounded cursor-pointer text-sm transition-colors"
          >
            <Package className="h-4 w-4 mr-1" />
            <span>{selectedModel}</span>
            <ChevronDown className="h-3 w-3 opacity-70 ml-1" />
          </button>

          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-1 bg-[#111111] rounded shadow-lg z-30 min-w-[120px] border border-[#222222] overflow-hidden">
              <div
                className={`px-3 py-1.5 hover:bg-[#1a1a1a] cursor-pointer text-sm flex items-center justify-between ${
                  selectedModel === "OpenAI" ? "text-teal-400" : "text-gray-400"
                }`}
                onClick={() => handleModelChange("OpenAI")}
              >
                OpenAI
                {selectedModel === "OpenAI" && (
                  <Check className="ml-2 h-4 w-4" />
                )}
              </div>
              <div
                className={`px-3 py-1.5 hover:bg-[#1a1a1a] cursor-pointer text-sm flex items-center justify-between ${
                  selectedModel === "Gemini" ? "text-teal-400" : "text-gray-400"
                }`}
                onClick={() => handleModelChange("Gemini")}
              >
                Gemini
                {selectedModel === "Gemini" && (
                  <Check className="ml-2 h-4 w-4" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
