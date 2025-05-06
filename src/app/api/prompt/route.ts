import { prisma } from "@/db";
import { PromptType } from "@/generated/prisma";
import { extractPythonCode } from "@/lib/parse/code";
import { SystemPrompt } from "@/lib/prompt";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from '@google/genai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { prompt, projectId, model } = body;

    // Get the project to check if it has a model specified
    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    });

    // Extract model from project description if available
    let selectedModel = model;
    if (!selectedModel && project?.description) {
      const modelMatch = project.description.match(/\[Model: (.*?)\]/);
      if (modelMatch && modelMatch[1]) {
        selectedModel = modelMatch[1];
      }
    }

    const promptResponse = await prisma.prompt.create({
      data: {
        value: prompt,
          project:{
            connect:{
              id  : projectId
            }
          },
        type: PromptType.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // TODO: Send these previous chats in the context
    // Commented out for now as it's not being used yet
    // const allPrompts = await prisma.prompt.findMany({
    //   where: {
    //     projectId: projectId,
    //   },
    // });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use the selected model or default to OpenAI
    let assistantReply;
    let responseText;

    if (selectedModel === 'Gemini') {
      try {
        // Configure Gemini model
        const config = {
          temperature: 0.2,
          responseMimeType: 'text/plain',
          systemInstruction: [
            {
              text: SystemPrompt,
            }
          ],
        };
        const model = 'gemini-2.5-flash-preview-04-17';
        const contents = [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ];

        // Generate content with Gemini
        const response = await ai.models.generateContentStream({
          model,
          config,
          contents,
        });

        // Collect all chunks of the response
        let fullResponse = '';
        for await (const chunk of response) {
          fullResponse += chunk.text || '';
        }

        assistantReply = fullResponse;
        responseText = fullResponse;
      } catch (error) {
        console.error("Error with Gemini API:", error);
        // Return error instead of falling back to OpenAI
        return NextResponse.json(
          { error: "Failed to process with Gemini API. Please try again or check your API key." },
          { status: 500 }
        );
      }
    } else {
      // Only try OpenAI if it was explicitly selected
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: "OpenAI API key is not configured" },
          { status: 500 }
        );
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: SystemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
      });

      assistantReply = response.choices[0].message.content;
      responseText = assistantReply;
    }

    // Log the full response text to see what we're working with
    console.log("Full response text:", responseText);
    console.log("Response text length:", responseText?.length);
    console.log("Contains <code> tag:", responseText?.includes("<code>"));
    console.log("Contains </code> tag:", responseText?.includes("</code>"));

    if (responseText?.includes("<code>")) {
      console.log("Index of <code>:", responseText.indexOf("<code>"));
      if (responseText?.includes("</code>")) {
        console.log("Index of </code>:", responseText.indexOf("</code>"));
      }
    }

    const code = extractPythonCode(responseText!);

    // Log the extracted code for debugging
    console.log("Extracted Python code:", code);
    console.log("Extracted code length:", code?.length);

    if (!code) {
      console.error("No Python code was extracted from the response");

      // Try extracting code again with a more focused approach
      // This is useful if the first extraction attempt failed but we can still find code
      console.log("Attempting to extract code with alternative methods...");

      // Try to extract code from markdown code blocks
      const markdownRegex = /```(?:python)?\s*([\s\S]*?)```/;
      const markdownMatch = responseText?.match(markdownRegex);

      if (markdownMatch && markdownMatch[1]) {
        console.log("Found code in markdown code block");
        let markdownCode = markdownMatch[1].trim();

        // Add imports if they're not included
        if (!markdownCode.includes("import")) {
          console.log("Adding basic imports to markdown code");
          markdownCode = "from manim import *\n\n" + markdownCode;
        }

        // Check for common Manim constants and functions that might need additional imports
        const needsRateFunctions =
          markdownCode.includes("LINEAR") ||
          markdownCode.includes("SMOOTH") ||
          markdownCode.includes("EASE_IN") ||
          markdownCode.includes("EASE_OUT") ||
          markdownCode.includes("EASE_IN_OUT") ||
          markdownCode.includes("rate_func=");

        if (needsRateFunctions && !markdownCode.includes("rate_functions")) {
          console.log("Adding rate_functions import to markdown code");
          if (markdownCode.includes("from manim import *")) {
            // Already has the main import, add the specific import for rate functions
            markdownCode = markdownCode.replace(
              "from manim import *",
              "from manim import *\nfrom manim.utils.rate_functions import LINEAR, SMOOTH, EASE_IN, EASE_OUT, EASE_IN_OUT"
            );
          } else {
            // Add both imports
            markdownCode = "from manim import *\nfrom manim.utils.rate_functions import LINEAR, SMOOTH, EASE_IN, EASE_OUT, EASE_IN_OUT\n\n" + markdownCode;
          }
        }

        console.log("Markdown code length:", markdownCode.length);

        // Continue with the extracted markdown code
        try {
          const fastApiResponse = await axios.post(
            `http://0.0.0.0:8000/run-manim`,
            {
              code: markdownCode,
            }
          );
          console.log("FastAPI response with markdown code:", fastApiResponse.data);
          const url = fastApiResponse.data.videoUrl;

          // Continue with the rest of the function using this URL
          await prisma.prompt.update({
            where: {
              id: promptResponse.id,
            },
            data: {
              videoUrl: url,
            },
          });

          await prisma.prompt.create({
            data: {
              value: assistantReply!,
              projectId: projectId,
              type: PromptType.SYSTEM,
              videoUrl: url,
            },
          });

          return NextResponse.json({
            reply: assistantReply,
            url,
            code: markdownCode,
            llmResponse: assistantReply,
            usedFallback: true
          });

        } catch (fallbackError: any) {
          console.error("Markdown code extraction failed:", fallbackError.response?.data || fallbackError.message);
        }
      }

      // If markdown extraction failed, try to find Python-like code patterns
      const pythonPatterns = [
        /from\s+manim\s+import[\s\S]*?class\s+\w+\s*\(\s*Scene\s*\)[\s\S]*?def\s+construct\s*\(\s*self[\s\S]*?\)[\s\S]*?:/i,
        /import\s+manim[\s\S]*?class\s+\w+\s*\(\s*Scene\s*\)[\s\S]*?def\s+construct\s*\(\s*self[\s\S]*?\)[\s\S]*?:/i,
        /class\s+\w+\s*\(\s*Scene\s*\):[\s\S]*?def\s+construct\s*\(\s*self[\s\S]*?\)[\s\S]*?:/i
      ];

      for (const pattern of pythonPatterns) {
        const pythonMatch = responseText?.match(pattern);
        if (pythonMatch && pythonMatch[0]) {
          console.log("Found Python-like code using pattern matching");

          // Try to extract a complete code block
          const startIndex = responseText!.indexOf(pythonMatch[0]);
          let endIndex = responseText!.length;

          // Try to find a reasonable end point (empty line or end of text)
          const potentialEnd = responseText!.substring(startIndex).search(/\n\s*\n/);
          if (potentialEnd > 0) {
            endIndex = startIndex + potentialEnd;
          }

          let extractedCode = responseText!.substring(startIndex, endIndex);

          // Add imports if they're not included
          if (!extractedCode.includes("import")) {
            console.log("Adding basic imports to extracted code");
            extractedCode = "from manim import *\n\n" + extractedCode;
          }

          // Check for common Manim constants and functions that might need additional imports
          const needsRateFunctions =
            extractedCode.includes("LINEAR") ||
            extractedCode.includes("SMOOTH") ||
            extractedCode.includes("EASE_IN") ||
            extractedCode.includes("EASE_OUT") ||
            extractedCode.includes("EASE_IN_OUT") ||
            extractedCode.includes("rate_func=");

          if (needsRateFunctions && !extractedCode.includes("rate_functions")) {
            console.log("Adding rate_functions import");
            if (extractedCode.includes("from manim import *")) {
              // Already has the main import, add the specific import for rate functions
              extractedCode = extractedCode.replace(
                "from manim import *",
                "from manim import *\nfrom manim.utils.rate_functions import LINEAR, SMOOTH, EASE_IN, EASE_OUT, EASE_IN_OUT"
              );
            } else {
              // Add both imports
              extractedCode = "from manim import *\nfrom manim.utils.rate_functions import LINEAR, SMOOTH, EASE_IN, EASE_OUT, EASE_IN_OUT\n\n" + extractedCode;
            }
          }

          console.log("Pattern-matched code length:", extractedCode.length);

          // Continue with the extracted code
          try {
            const fastApiResponse = await axios.post(
              `http://0.0.0.0:8000/run-manim`,
              {
                code: extractedCode,
              }
            );
            console.log("FastAPI response with pattern-matched code:", fastApiResponse.data);
            const url = fastApiResponse.data.videoUrl;

            // Continue with the rest of the function using this URL
            await prisma.prompt.update({
              where: {
                id: promptResponse.id,
              },
              data: {
                videoUrl: url,
              },
            });

            await prisma.prompt.create({
              data: {
                value: assistantReply!,
                projectId: projectId,
                type: PromptType.SYSTEM,
                videoUrl: url,
              },
            });

            return NextResponse.json({
              reply: assistantReply,
              url,
              code: extractedCode,
              llmResponse: assistantReply,
              usedFallback: true
            });

          } catch (fallbackError: any) {
            console.error("Pattern-matched code extraction failed:", fallbackError.response?.data || fallbackError.message);
          }

          // If we found a pattern match but it failed, don't try other patterns
          break;
        }
      }

      // If we get here, both extraction methods failed
      // Return a more detailed error message
      return NextResponse.json(
        {
          error: "No Python code was found in the AI response",
          responseText: responseText?.substring(0, 500) + (responseText && responseText.length > 500 ? "..." : ""),
          containsCodeTags: {
            openTag: responseText?.includes("<code>"),
            closeTag: responseText?.includes("</code>")
          }
        },
        { status: 400 }
      );
    }

    let url: string;
    try {
      console.log("Sending code to FastAPI endpoint...");
      const fastApiResponse = await axios.post(
        `http://0.0.0.0:8000/run-manim`,
        {
          code,
        }
      );
      console.log("FastAPI response:", fastApiResponse.data);

      if (!fastApiResponse.data.videoUrl) {
        throw new Error("FastAPI response did not include a videoUrl");
      }

      url = fastApiResponse.data.videoUrl;

      // Update the prompt with the video URL
      await prisma.prompt.update({
        where: {
          id: promptResponse.id,
        },
        data: {
          videoUrl: url,
        },
      });

      // Create a new system prompt with the assistant's reply
      await prisma.prompt.create({
        data: {
          value: assistantReply!,
          projectId: projectId,
          type: PromptType.SYSTEM,
          videoUrl: url,
        },
      });

      // Return the successful response
      return NextResponse.json({
        reply: assistantReply,
        url,
        code,
        llmResponse: assistantReply,
      });

    } catch (error: any) {
      console.error("Error from FastAPI:", error.response?.data || error.message);

      // Check for specific error types
      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || error.message;

      // Check for Manim installation error
      if (errorMessage.includes("system cannot find the file specified") ||
          errorMessage.includes("No such file or directory")) {

        // This is likely a Manim installation issue
        return NextResponse.json(
          {
            error: "Manim is not properly installed on the server",
            details: "The animation engine (Manim) is not properly installed or configured on the server. Please contact the administrator.",
            setupInstructions: "Make sure Manim is installed and in the system PATH. Run 'pip install manim' and ensure ffmpeg is installed.",
            code: code.substring(0, 500) + (code.length > 500 ? "..." : ""),
            rawError: errorMessage
          },
          { status: 500 }
        );
      }

      // Return a more detailed error message for other errors
      return NextResponse.json(
        {
          error: "Failed to process animation code",
          details: errorMessage,
          code: code.substring(0, 500) + (code.length > 500 ? "..." : ""),
          rawError: errorData
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
};
