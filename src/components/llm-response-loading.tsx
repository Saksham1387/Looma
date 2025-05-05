import { useState, useEffect } from "react";
import { Loader2, Sparkles, Clock, Cpu, Database, Stars } from "lucide-react";

export const LLMResponseLoading = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const processingStages = [
    { text: "Initializing...", icon: Loader2 },
    { text: "Analyzing request...", icon: Database },
    { text: "Processing data...", icon: Cpu },
    { text: "Generating animation...", icon: Sparkles },
    { text: "Finalizing results...", icon: Stars },
    { text: "Almost there...", icon: Clock },
  ];

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) =>
        prev >= processingStages.length - 1 ? 0 : prev + 1
      );
    }, 2000);

    return () => {
      clearInterval(stageInterval);
    };
  }, []);

  const CurrentIcon = processingStages[currentStageIndex].icon;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-950 border-none rounded-xl shadow-lg overflow-hidden backdrop-blur-lg">
        <div className="p-6 space-y-5">
          <div className="w-full flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-30 blur-md animate-pulse"></div>
              <div className="relative bg-slate-800 rounded-full p-3">
                <CurrentIcon className="h-6 w-6 text-cyan-400 animate-spin" />
              </div>
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="h-6 overflow-hidden relative">
              {processingStages.map((stage, index) => (
                <div
                  key={index}
                  className="font-medium text-lg absolute w-full transition-all duration-300 ease-in-out"
                  style={{
                    transform: `translateY(${
                      (index - currentStageIndex) * 100
                    }%)`,
                    opacity: index === currentStageIndex ? 1 : 0,
                  }}
                >
                  <span className="bg-gradient-to-r from-cyan-300 to-purple-300 text-transparent bg-clip-text">
                    {stage.text}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Please wait while we process your request
            </p>
          </div>
          <div className="flex justify-center gap-1.5 pt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                style={{
                  animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};
