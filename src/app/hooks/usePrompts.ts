import axios from "axios";
import { useEffect, useState } from "react";

interface Prompt {
  id: string;
  value: string;
  type: "USER" | "SYSTEM";
  createdAt: string;
  videoUrl:string
}

export function usePrompts(projectId: string) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const fetchPrompts = async () => {
      const res = await axios.get(`/api/project/${projectId}/prompts`);
      setPrompts(res.data);
    };
    fetchPrompts();

    console.log("prompts", prompts);
  }, [projectId]);

  return {
    prompts,
  };
}
