import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export const ChatErrorCard = ({ error }: { error: string }) => {
  return (
    <Card className="mb-6 bg-red-900/20 border-red-800/50 animate-fade-in">
      <CardContent className="p-6 flex items-start gap-3">
        <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
        <div>
          <strong className="font-bold text-red-300">Error: </strong>
          <span className="block mt-1 text-red-200">{error}</span>
        </div>
      </CardContent>
    </Card>
  );
};
