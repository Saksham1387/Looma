export function extractPythonCode(response: string): string | null {
  // Add logging to debug the extraction process
  console.log("Extracting Python code from response...");

  if (!response) {
    console.error("Response is empty or undefined");
    return null;
  }

  // First, try to extract code from <code> tags
  const codeTagRegex = /<code>([\s\S]*?)<\/code>/i;
  const codeTagMatch = response.match(codeTagRegex);

  if (codeTagMatch && codeTagMatch[1]) {
    console.log("Code extracted using <code> tags");
    return codeTagMatch[1].trim();
  }

  // If no <code> tags, try to extract code from markdown code blocks
  const markdownRegex = /```(?:python)?\s*([\s\S]*?)```/;
  const markdownMatch = response.match(markdownRegex);

  if (markdownMatch && markdownMatch[1]) {
    console.log("Code extracted from markdown code block");
    return markdownMatch[1].trim();
  }

  // If we still don't have code, try to find Python-like code patterns
  const pythonPatterns = [
    /from\s+manim\s+import[\s\S]*?class\s+\w+\s*\(\s*Scene\s*\)[\s\S]*?def\s+construct\s*\(\s*self[\s\S]*?\)[\s\S]*?:/i,
    /import\s+manim[\s\S]*?class\s+\w+\s*\(\s*Scene\s*\)[\s\S]*?def\s+construct\s*\(\s*self[\s\S]*?\)[\s\S]*?:/i
  ];

  for (const pattern of pythonPatterns) {
    const pythonMatch = response.match(pattern);
    if (pythonMatch && pythonMatch[0]) {
      console.log("Found Python-like code using pattern matching");

      // Try to extract a complete code block by finding the class definition
      const classMatch = response.match(/class\s+\w+\s*\(\s*Scene\s*\):[\s\S]*?(?=\n\n|\n[^\s]|$)/);
      if (classMatch && classMatch[0]) {
        let codeBlock = classMatch[0];

        // Add imports if they're not included
        if (!codeBlock.includes("import")) {
          console.log("Adding basic imports to extracted code");
          codeBlock = "from manim import *\n\n" + codeBlock;
        }

        // Check for common Manim constants and functions that might need additional imports
        const needsRateFunctions =
          codeBlock.includes("LINEAR") ||
          codeBlock.includes("SMOOTH") ||
          codeBlock.includes("EASE_IN") ||
          codeBlock.includes("EASE_OUT") ||
          codeBlock.includes("EASE_IN_OUT") ||
          codeBlock.includes("rate_func=");

        if (needsRateFunctions && !codeBlock.includes("rate_functions")) {
          console.log("Adding rate_functions import");
          if (codeBlock.includes("from manim import *")) {
            // Already has the main import, add the specific import for rate functions
            codeBlock = codeBlock.replace(
              "from manim import *",
              "from manim import *\nfrom manim.utils.rate_functions import LINEAR, SMOOTH, EASE_IN, EASE_OUT, EASE_IN_OUT"
            );
          } else {
            // Add both imports
            codeBlock = "from manim import *\nfrom manim.utils.rate_functions import LINEAR, SMOOTH, EASE_IN, EASE_OUT, EASE_IN_OUT\n\n" + codeBlock;
          }
        }

        return codeBlock;
      }

      // If we can't extract a clean class definition, get a reasonable chunk after the match
      const startIndex = response.indexOf(pythonMatch[0]);
      let endIndex = response.length;

      // Try to find a reasonable end point (empty line or end of text)
      const potentialEnd = response.substring(startIndex).search(/\n\s*\n/);
      if (potentialEnd > 0) {
        endIndex = startIndex + potentialEnd;
      }

      const extractedCode = response.substring(startIndex, endIndex);

      // Add imports if they're not included
      let updatedCode = extractedCode;

      // Check if imports are needed
      if (!updatedCode.includes("import")) {
        console.log("Adding basic imports to extracted code");
        updatedCode = "from manim import *\n\n" + updatedCode;
      }

      // Check for common Manim constants and functions that might need additional imports
      const needsRateFunctions =
        updatedCode.includes("LINEAR") ||
        updatedCode.includes("SMOOTH") ||
        updatedCode.includes("EASE_IN") ||
        updatedCode.includes("EASE_OUT") ||
        updatedCode.includes("EASE_IN_OUT") ||
        updatedCode.includes("rate_func=");

      if (needsRateFunctions && !updatedCode.includes("rate_functions")) {
        console.log("Adding rate_functions import");
        if (updatedCode.includes("from manim import *")) {
          // Already has the main import, add the specific import for rate functions
          updatedCode = updatedCode.replace(
            "from manim import *",
            "from manim import *\nfrom manim.utils.rate_functions import LINEAR, SMOOTH, EASE_IN, EASE_OUT, EASE_IN_OUT"
          );
        } else {
          // Add both imports
          updatedCode = "from manim import *\nfrom manim.utils.rate_functions import LINEAR, SMOOTH, EASE_IN, EASE_OUT, EASE_IN_OUT\n\n" + updatedCode;
        }
      }

      return updatedCode;
    }
  }

  console.error("No code found in response using any extraction method");
  return null;
}
