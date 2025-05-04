import { Camera, Figma, FormInput, Layout, Plus, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const Landing = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <main className="flex-1 p-4 md:p-6 space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center pt-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
            What can I help you ship?
          </h1>
          <div className="w-full max-w-xl mx-auto mt-8 bg-muted/50 rounded-lg p-4">
            <div className="bg-background rounded-md p-4 mb-4">
              <Input
                placeholder="Ask v0 to build..."
                className="border-0 shadow-none focus-visible:ring-0 px-0"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button variant="outline" size="sm">
                  No project selected
                  <span className="ml-1">▼</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Expand</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M21 3 9 15" />
                    <path d="M12 3H3v18h18v-9" />
                    <path d="M16 3h5v5" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Attach</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Send</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <Button variant="outline" className="gap-2">
              <Camera className="h-4 w-4" />
              Clone a Screenshot
            </Button>
            <Button variant="outline" className="gap-2">
              <Figma className="h-4 w-4" />
              Import from Figma
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload a Project
            </Button>
            <Button variant="outline" className="gap-2">
              <Layout className="h-4 w-4" />
              Landing Page
            </Button>
            <Button variant="outline" className="gap-2">
              <FormInput className="h-4 w-4" />
              Sign Up Form
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
