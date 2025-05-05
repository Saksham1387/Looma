"use client";
import { useState, useEffect } from "react";
import { Send } from "lucide-react";

export const LandingTextBox = () => {
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(true);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");

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

  const handleSubmit = () => {
    console.log("Submitting:", input);
  };

  return (
    <div className="w-full flex flex-row relative">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
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

      <button
        onClick={handleSubmit}
        className="p-2 flex items-start cursor-pointer"
      >
        <Send className="text-white" />
      </button>
    </div>
  );
};
