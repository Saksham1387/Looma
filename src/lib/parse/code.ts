export function extractPythonCode(response: string): string | null {

  if (!response) {
    console.error("Response is empty or undefined");
    return null;
  }

  // Try <code> HTML blocks
  const codeTagMatch = response.match(/<code>([\s\S]*?)<\/code>/i);
  if (codeTagMatch?.[1]) {
    console.log("Code extracted using <code> tags");
    return codeTagMatch[1].trim();
  }

  // Try ```markdown code blocks for GEMINI
  const markdownMatch = response.match(/```(?:python)?\s*([\s\S]*?)```/);
  if (markdownMatch?.[1]) {
    console.log("Code extracted from markdown code block");
    return markdownMatch[1].trim();
  }

  // Fallback: heuristic pattern match
  const pythonPatterns = [
    /from\s+manim\s+import[\s\S]*?class\s+\w+\s*\(\s*Scene\s*\)[\s\S]*?def\s+construct\s*\(\s*self[\s\S]*?\)[\s\S]*?:/i,
    /import\s+manim[\s\S]*?class\s+\w+\s*\(\s*Scene\s*\)[\s\S]*?def\s+construct\s*\(\s*self[\s\S]*?\)[\s\S]*?:/i,
  ];

  for (const pattern of pythonPatterns) {
    const pythonMatch = response.match(pattern);
    if (pythonMatch?.[0]) {
      console.log("Found Python-like code using pattern matching");

      // Extract class block
      const classBlock = response.match(/class\s+\w+\s*\(\s*Scene\s*\):[\s\S]*?(?=\n\n|\n[^\s]|$)/)?.[0] || pythonMatch[0];

      let codeBlock = classBlock.trim();

      // Add imports if missing
      const hasImport = /import\s+manim|from\s+manim/.test(response);
      if (!hasImport) {
        console.log("Adding basic imports to extracted code");
        codeBlock = `from manim import *\n\n${codeBlock}`;
      }

      // Detect rate function usage
      const usesRateFunctions =
        /(LINEAR|SMOOTH|EASE_IN|EASE_OUT|EASE_IN_OUT|rate_func\s*=)/.test(codeBlock);

      if (usesRateFunctions) {
        console.log("Detected rate function usage");

        // Add correct modern imports
        const modernRateImport = "from manim.rate_functions import linear, smooth, ease_in, ease_out, ease_in_out";
        if (codeBlock.includes("from manim import *")) {
          codeBlock = codeBlock.replace(
            "from manim import *",
            `from manim import *\n${modernRateImport}`
          );
        } else {
          codeBlock = `${modernRateImport}\n${codeBlock}`;
        }

        // Optionally replace deprecated constants
        codeBlock = codeBlock
          .replace(/\bLINEAR\b/g, "linear")
          .replace(/\bSMOOTH\b/g, "smooth")
          .replace(/\bEASE_IN\b/g, "ease_in")
          .replace(/\bEASE_OUT\b/g, "ease_out")
          .replace(/\bEASE_IN_OUT\b/g, "ease_in_out");
      }

      return codeBlock;
    }
  }

  console.error("No code found in response using any extraction method");
  return null;
}
