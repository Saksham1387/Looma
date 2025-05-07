import { ChevronDown, ChevronUp, Code } from "lucide-react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/default-highlight";
import { Button } from "./ui/button";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CSSProperties, ComponentProps } from "react";

type CodeComponentProps = ComponentProps<"code"> & {
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

  const hasCodeBlock =
    content.includes("<code>") && content.includes("</code>");

  if (!hasCodeBlock) {
    return (
      <ReactMarkdown
        components={{
          code: ({
            inline,
            className,
            children,
            ...props
          }: CodeComponentProps) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus as unknown as  StyleType}
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
            <pre className="bg-[#0f0f0f] p-4 rounded-lg overflow-x-auto">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }

  const textBeforeCode = content.split("<code>")[0];
  const codeContent = content.split("<code>")[1]?.split("</code>")[0] || "";
  const textAfterCode = content.split("</code>")[1] || "";

  const isExpanded = expandedCodeMap[promptId] || false;

  return (
    <div className="space-y-3 w-full">
      {textBeforeCode && (
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="text-slate-300 leading-relaxed ">{children}</p>
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
          className="flex items-center gap-2  bg-neutral-800 text-slate-300 hover:bg-neutral-900 border-neutral-700 hover:text-slate-200 w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Code size={16} />
            <span>View Code</span>
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>

        {/* Code content */}
        {isExpanded && codeContent && (
          <div className="border border-neutral-700 rounded-md w-full">
            <div className="max-w-full overflow-x-auto ">
              <div className="min-w-0 ">
                <SyntaxHighlighter
                  style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                  language="python"
                  className="!m-0 !p-4"
                  customStyle={{
                    backgroundColor: "transparent",
                    margin: 0,
                    padding: "1rem",
                    overflowX: "visible",
                    width: "fit-content",
                    minWidth: "100%",
                  }}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text after code */}
      {textAfterCode && (
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="text-slate-300 leading-relaxed ">{children}</p>
            ),
          }}
        >
          {textAfterCode}
        </ReactMarkdown>
      )}
    </div>
  );
};
