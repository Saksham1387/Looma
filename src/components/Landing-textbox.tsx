"use client";
import { useState, useEffect } from "react";
import { Send, ChevronDown } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const LandingTextBox = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(true);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [selectedModel, setSelectedModel] = useState("OpenAI");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/project", {
        prompt: input,
        model: selectedModel,
      });
      const id = res.data.project.id;
      router.push(`/chat/${id}?prompt=${encodeURIComponent(input)}&model=${selectedModel}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col relative">
      <div className="flex flex-row relative w-full">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className="bg-transparent text-gray-300 w-full outline-none resize-none text-lg h-32 border-b border-blue-900/30 relative z-10 p-2"
          placeholder=""
        />

        {!input && (
          <div
            className="absolute left-2 top-2 pointer-events-none text-gray-500 text-lg"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}
          >
            {currentPlaceholder}
          </div>
        )}

        {/* Model selector - positioned in the top right corner */}
        <div className="absolute right-12 top-2 z-20">
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1 text-gray-400 hover:text-gray-300 px-2 py-1 rounded cursor-pointer text-sm transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              <span>Model: {selectedModel}</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 bg-gray-900/90 rounded shadow-lg z-30 min-w-[120px] border border-gray-800/50 overflow-hidden">
                <div
                  className={`px-3 py-1.5 hover:bg-gray-800/70 cursor-pointer text-sm ${selectedModel === 'OpenAI' ? 'text-blue-400' : 'text-gray-400'}`}
                  onClick={() => {
                    setSelectedModel('OpenAI');
                    setIsDropdownOpen(false);
                  }}
                >
                  OpenAI
                </div>
                <div
                  className={`px-3 py-1.5 hover:bg-gray-800/70 cursor-pointer text-sm ${selectedModel === 'Gemini' ? 'text-blue-400' : 'text-gray-400'}`}
                  onClick={() => {
                    setSelectedModel('Gemini');
                    setIsDropdownOpen(false);
                  }}
                >
                  Gemini
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="p-2 flex items-start cursor-pointer"
        >
          <Send className="text-white" />
        </button>
      </div>
    </form>
  );
};
