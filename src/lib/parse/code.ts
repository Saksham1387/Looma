export function extractPythonCode(response: string): string | null {
  const startIndex = response.indexOf("<code>");
  if (startIndex === -1) {
    return null;
  }

  let codeContent = response.substring(startIndex + 6);

  const endIndex = codeContent.indexOf("</code>");
  if (endIndex !== -1) {
    codeContent = codeContent.substring(0, endIndex);
  }

  return codeContent.trim();
}
