import { Film } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export const ChatLayoutCard = () => {
  return (
    <Card className="bg-black border-slate-800 max-w-lg w-full shadow-lg animate-fade-in">
      <CardContent className="p-8 text-center">
        <Film size={48} className="mx-auto mb-4 text-slate-400 opacity-80" />
        <h3 className="text-2xl font-bold mb-2 text-slate-200">
          Looma Animation Generator
        </h3>
        <p className="text-slate-400 mb-6">
          Enter a prompt to generate a mathematical animation video
        </p>
      </CardContent>
    </Card>
  );
};
