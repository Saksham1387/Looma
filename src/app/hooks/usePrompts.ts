import axios from "axios";
import { useEffect, useState } from "react";

export interface Prompt {
  id: string;
  value: string;
  type: "USER" | "SYSTEM";
  createdAt: string;
  videoUrl: string;
}

export function usePrompts(projectId: string) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = async () => {
    console.log("Fetching prompts for project", projectId);
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`/api/project/${projectId}/prompts`);
      setPrompts(res.data);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      setError("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  const addPrompt = (newPrompt: Prompt) => {
    setPrompts(prevPrompts => [...prevPrompts, newPrompt]);
  };

  const updatePrompt = (promptId: string, updatedPrompt: Prompt) => {
    setPrompts(prevPrompts => 
      prevPrompts.map(prompt => 
        prompt.id === promptId ? updatedPrompt : prompt
      )
    );
  };

  useEffect(() => {
    fetchPrompts();
  }, [projectId]);

  return {
    prompts,
    isLoading,
    error,
    refetchPrompts: fetchPrompts,
    addPrompt,
    updatePrompt,
  };
}