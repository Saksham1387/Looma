
import axios from "axios";
import { useEffect, useState } from "react";

interface Prompt {
  id: string;
  content: string;
  type: "USER" | "SYSTEM";
  createdAt: string;
}
export function usePrompts(projectId: string) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const fetchPrompts = async () => {
      const res = await axios.get(
        `/api/project/${projectId}/prompts`
      );
      setPrompts(res.data.prompts);
    };

    let interval = setInterval(fetchPrompts, 100);
    return () => clearInterval(interval);
  });

  return {
    prompts,
  };
}
