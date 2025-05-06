import { Download } from "lucide-react";
import { Card } from "./ui/card";

interface VideoCardProps {
  videoUrl: string;
}

export const VideoCard = ({ videoUrl }: VideoCardProps) => {
  const handleDownload = async () => {
    if (!videoUrl) return;

    try {
      const response = await fetch(videoUrl, {
        mode: 'no-cors'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `looma-animation-${new Date().getTime()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      <Card className="overflow-hidden bg-neutral-950 border-none">
        <div className="relative">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain bg-black rounded-3xl"
          >
            Your browser does not support the video tag.
          </video>
          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-20">
            <button
              onClick={handleDownload}
              className="h-8 w-8 rounded-full bg-[#0f0f0f] cursor-pointer hover:text-teal-400 text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              aria-label="Download video"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
