import { prisma } from "@/db";
import { SystemPrompt } from "@/lib/prompt";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { prompt ,projectId } = body;

    const allPrompts = await prisma.prompt.findMany({
      where: {
        projectId: projectId,
      },
    });

    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { role: 'system', content: SystemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
    });

    const assistantReply = response.choices[0].message.content;

    return NextResponse.json({
      reply: assistantReply,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' }, 
      { status: 500 }
    );
  }
}