import { prisma } from "@/db";
import { PromptType } from "@/generated/prisma";
import { extractPythonCode } from "@/lib/parse/code";
import { SystemPrompt } from "@/lib/prompt";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

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
    
    if (model === "Gemini") {
      const { text } = await generateText({
        model: google("models/gemini-2.5-pro-exp-03-25"),
        prompt: prompt,
        system:SystemPrompt
      });
      responseText = text;
      console.log("responseText-----");
      console.log(responseText);
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
      console.log("responseText-----");
      console.log(responseText);
    }

    const code = extractPythonCode(responseText!);

    let fastApiResponse;
    try {
      fastApiResponse = await axios.post(process.env.WORKER_URL!, {
        code,
      });
    } catch (e) {
      await prisma.prompt.delete({
        where: {
          id: userPrompt.id,
        },
      });
      return NextResponse.json({
        error: "Failed to run manim",
      });
    }

    const url = fastApiResponse.data.videoUrl;

    await prisma.prompt.update({
      where: {
        id: userPrompt.id,
      },
      data: {
        videoUrl: url,
      },
    });

    await prisma.prompt.create({
      data: {
        value: responseText!,
        projectId: projectId,
        type: PromptType.SYSTEM,
        videoUrl: url,
      },
    });

    return NextResponse.json({
      reply: responseText,
      url,
      code,
      llmResponse: responseText,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
};
