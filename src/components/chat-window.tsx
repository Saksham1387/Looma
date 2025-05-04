"use client";
import { usePrompts } from "@/app/hooks/usePrompts";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Send } from "lucide-react";
import { useState } from "react";

interface Prompt {
  id: string;
  content: string;
  type: "USER" | "SYSTEM";
  createdAt: string;
}

type Props = {
  id: string;
};

const Chatpage = ({ id }: Props) => {
  const [loading, setLoading] = useState(false);
  const { prompts } = usePrompts(id);
  const [input, setInput] = useState("");
  return (
    <div>
      <div className="flex h-screen">
        <div className="w-1/4 border-r-2 h-screen flex flex-col justify-between ">
          <div>Chat history</div>
          {prompts.length != 0 && (
            <div>
              {prompts
                .filter((prompt) => prompt.type === "USER")
                .map((prompt) => (
                  <div key={prompt.id}>{prompt.content}</div>
                ))}
            </div>
          )}
          <div className="flex flex-row">
            <Input onChange={(e) => setInput(e.target.value)}></Input>
            <button
              className="cursor-pointer"
              onClick={async () => {
                await axios.post(`/api/prompt`, {
                  prompt: input,
                });
              }}
            >
              <Send />
            </button>
          </div>
        </div>
        <div className="w-3/4 p-5">
          <iframe src="http://localhost:8080" width={"100%"} height={"100%"} />
        </div>
      </div>
    </div>
  );
};

export default Chatpage;
