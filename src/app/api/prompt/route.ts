import { prisma } from "@/db";
import { PromptType } from "@/generated/prisma";
import { extractPythonCode } from "@/lib/parse/code";
import { SystemPrompt } from "@/lib/prompt";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { google } from "@ai-sdk/google";
import { generateText } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { prompt, projectId, model } = body;
    const userPrompt = await prisma.prompt.create({
      data: {
        value: prompt,
        project: {
          connect: {
            id: projectId,
          },
        },
        type: PromptType.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // TODO: Send these previous chats in the context
    const allPrompts = await prisma.prompt.findMany({
      where: {
        projectId: projectId,
      },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let responseText;
    const model1 = "Gemini";
    if (model1 === "Gemini") {

      const { text } = await generateText({
        model: google("models/gemini-2.5-pro-exp-03-25"),
        prompt: prompt,
        system: SystemPrompt,
      });
      responseText = text
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-2025-04-14",
        messages: [
          { role: "system", content: SystemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
      });
      const assistantReply = response.choices[0].message.content;
      responseText = assistantReply;
    }

    const code = extractPythonCode(responseText!);

    const llmPrompt = await prisma.prompt.create({
      data: {
        value: responseText!,
        projectId: projectId,
        type: PromptType.SYSTEM,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    let fastApiResponse;
    try {
      fastApiResponse = await axios.post(`http://0.0.0.0:8000/api/render`, {
        code,
        prompt_id: llmPrompt.id,
      });
    } catch (e) {
      // If the FAST API failed then just remove both the prompts
      await prisma.prompt.delete({
        where: {
          id: userPrompt.id,
        },
      });

      await prisma.prompt.delete({
        where: {
          id: llmPrompt.id,
        },
      });
      return NextResponse.json({
        error: "Failed to run manim",
      });
    }

    return NextResponse.json({
      reply: responseText,
      llmResponse: responseText,
      taskId: fastApiResponse.data.task_id,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
};
