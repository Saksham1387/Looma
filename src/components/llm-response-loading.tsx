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
    <div className="w-full max-w-md mx-auto text-white flex-col items-center">
      <div className="border-none overflow-hidden backdrop-blur-lg">
        <div className="p-6 space-y-5  rounded-lg shadow">
          <div className="w-full flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-black rounded-full opacity-10 blur-md animate-pulse"></div>
              <div className="relative bg-black rounded-full p-3">
                <CurrentIcon className="h-6 w-6 text-white animate-spin" />
              </div>
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="h-6 overflow-hidden relative">
              {processingStages.map((stage, index) => (
                <div
                  key={index}
                  className="font-medium text-lg absolute w-full text-whitetransition-all duration-300 ease-in-out"
                  style={{
                    transform: `translateY(${
                      (index - currentStageIndex) * 100
                    }%)`,
                    opacity: index === currentStageIndex ? 1 : 0,
                    color: "white",
                  }}
                >
                  {stage.text}
                </div>
              ))}
            </div>
            <p className="text-xs text-white opacity-60">
              Please wait while we process your request
            </p>
          </div>
          <div className="flex justify-center gap-1.5 pt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full text-white"
                style={{
                  animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

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
