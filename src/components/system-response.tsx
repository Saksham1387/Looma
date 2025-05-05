import { ChevronDown, ChevronUp, Code } from "lucide-react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/default-highlight";
import { Button } from "./ui/button";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CSSProperties, ComponentProps } from "react";

type CodeComponentProps = ComponentProps<'code'> & {
  inline?: boolean;
};

type StyleType = {
  [key: string]: CSSProperties;
};

export const SystemResponse = ({
    content,
    promptId,
    expandedCodeMap,
    setExpandedCodeMap,
  }: {
    content: string;
    promptId: string;
    expandedCodeMap: Record<string, boolean>;
    setExpandedCodeMap: (map: Record<string, boolean>) => void;
  }) => {
    
    const toggleCodeVisibility = (promptId: string) => {
        setExpandedCodeMap({
          ...expandedCodeMap,
          [promptId]: !expandedCodeMap[promptId],
        });
      };
    // Check if response contains code blocks
    const hasCodeBlock =
      content.includes("<code>") && content.includes("</code>");

    if (!hasCodeBlock) {
      return (
        <ReactMarkdown
          components={{
            code: ({ inline, className, children, ...props }: CodeComponentProps) => {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus as StyleType}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            p: ({ children }) => (
              <p className="text-slate-300 leading-relaxed">{children}</p>
            ),
            pre: ({ children }) => (
              <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto">
                {children}
              </pre>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      );
    }

    // Extract text and code parts
    const textBeforeCode = content.split("<code>")[0];
    const codeContent = content.split("<code>")[1]?.split("</code>")[0] || "";
    const textAfterCode = content.split("</code>")[1] || "";

    const isExpanded = expandedCodeMap[promptId] || false;

    return (
      <div className="space-y-3 w-full">
        {/* Text before code */}
        {textBeforeCode && (
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-slate-300 leading-relaxed">{children}</p>
              ),
            }}
          >
            {textBeforeCode}
          </ReactMarkdown>
        )}

        {/* Code toggle button */}
        <div className="space-y-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleCodeVisibility(promptId)}
            className="flex items-center gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-200 w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Code size={16} />
              <span>View Code</span>
            </div>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>

          {/* Code content */}
          {isExpanded && codeContent && (
            <div className="border border-slate-700 rounded-md overflow-x-auto w-full">
              <div className="min-w-0">
                <SyntaxHighlighter
                  style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                  language="python"
                  className="!m-0 !p-4"
                  customStyle={{
                    maxWidth: '100%',
                    overflowX: 'auto',
                    backgroundColor: 'transparent',
                    margin: 0,
                    padding: '1rem'
                  }}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>

        {/* Text after code */}
        {textAfterCode && (
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-slate-300 leading-relaxed">{children}</p>
              ),
            }}
          >
            {textAfterCode}
          </ReactMarkdown>
        )}
      </div>
    );
  };