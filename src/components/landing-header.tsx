"use client";
import { Film } from "lucide-react";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
export const LandingHeader = () => {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <header className="flex justify-between items-center bg-neutral-940 shadow-2xl mb-12 border-2 border-neutral-950 rounded-2xl py-4 p-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full  flex items-center justify-center">
          <Film className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Looma</h1>
      </div>
      <div className="flex gap-4">
       {!session && <Button onClick={() => router.push("/auth")}>Signin</Button>}
      </div>
    </header>
  );
};
