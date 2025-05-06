import { AlertCircle, Info, Terminal } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";

interface ErrorDetails {
  error: string;
  details?: string;
  setupInstructions?: string;
  code?: string;
  rawError?: any;
}

export const ChatErrorCard = ({ error }: { error: string | ErrorDetails }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Handle both string errors and error objects
  const errorObj = typeof error === 'string'
    ? { error }
    : error;

  const hasDetails = errorObj.details || errorObj.setupInstructions || errorObj.code;

  return (
    <Card className="mb-6 bg-red-900/20 border-red-800/50 animate-fade-in">
      <CardContent className="p-6 flex flex-col">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
          <div className="flex-1">
            <strong className="font-bold text-red-300">Error: </strong>
            <span className="block mt-1 text-red-200">{errorObj.error}</span>

            {hasDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="mt-3 text-red-300 hover:text-red-200 hover:bg-red-900/30 p-2"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </Button>
            )}
          </div>
        </div>

        {showDetails && hasDetails && (
          <div className="mt-4 pl-8 border-l border-red-800/50 space-y-4">
            {errorObj.details && (
              <div className="text-red-200 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={16} className="text-red-400" />
                  <span className="font-semibold">Details</span>
                </div>
                <p className="ml-6">{errorObj.details}</p>
              </div>
            )}

            {errorObj.setupInstructions && (
              <div className="text-red-200 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Terminal size={16} className="text-red-400" />
                  <span className="font-semibold">Setup Instructions</span>
                </div>
                <p className="ml-6">{errorObj.setupInstructions}</p>
              </div>
            )}

            {errorObj.code && (
              <div className="text-red-200 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Terminal size={16} className="text-red-400" />
                  <span className="font-semibold">Generated Code</span>
                </div>
                <pre className="ml-6 mt-2 p-3 bg-red-950/30 rounded overflow-x-auto text-xs">
                  {errorObj.code}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
