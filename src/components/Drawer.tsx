"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import {
  Film,
  LogInIcon,
  LogOutIcon,
  MessageCircleMore,
  PlusCircleIcon,
} from "lucide-react";
import { Separator } from "./ui/separator";
import axios from "axios";
import Link from "next/link";

const DRAWER_WIDTH = 250;

type TChat = {
  id: string;
  name: string;
};

export function ChatsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [chats, setChats] = useState<TChat[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("/api/project");
        const data = res.data;
        console.log(data.projects);
        setChats(data.projects);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchChats();
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < 40) {
        setIsOpen(true);
      }
      if (e.clientX > DRAWER_WIDTH) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const ChatSkeleton = () => (
    <div className="pb-2 flex flex-col gap-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="gap-2 bg-gray-950 rounded-xl text-sm p-3 pb-3 animate-pulse flex justify-between"
        >
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          <div className="h-5 w-5 bg-gray-800 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="left">
      <DrawerContent
        style={{
          maxWidth: DRAWER_WIDTH,
          position: "fixed",
          bottom: 0,
          left: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
        className="bg-gray-900 text-white border-none"
      >
        <DrawerHeader className="p-4 space-y-4">
          <div className="flex flex-row items-center gap-2 bg-gray-950 rounded-xl p-3">
            <Film className="text-white w-6 h-6" />
            <div className="pt-2 text-xl font-bold">Looma</div>
          </div>

          <Separator className="border-none"></Separator>

          {session ? (
            <>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 bg-gray-950 border-none"
              >
                <PlusCircleIcon size={18} />
                <span>New Chat</span>
              </Button>

              {loading ? (
                <ChatSkeleton />
              ) : chats && chats.length > 0 ? (
                <div>
                  {chats.map((chat, index) => (
                    <Link key={index} href={`/chat/${chat.id}`}>
                      <div className="pb-2 flex flex-col gap-2 cursor-pointer">
                        <div className="gap-2 bg-gray-950 rounded-xl text-sm p-3 pb-3 hover:bg-gray-950/50 flex justify-between">
                          {chat.name.length > 20
                            ? `${chat.name.substring(0, 20)}...`
                            : chat.name}
                          <MessageCircleMore className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 mt-2">
                  <div className="text-sm text-gray-400 text-center py-4">
                    No chats yet. Start a new conversation!
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 mt-8">
              <div className="text-sm text-gray-400 text-center py-4">
                Please login to access chats
              </div>
              <Link href="/auth">
                <Button
                  variant="outline"
                  className="flex items-center gap-2  text-white border-none bg-gray-950 hover:bg-gray-950/50 hover:text-white"
                >
                  <LogInIcon size={18} />
                  <span>Login</span>
                </Button>
              </Link>
            </div>
          )}
        </DrawerHeader>
        <div className="flex-grow"></div>

        <DrawerFooter className="p-4 pt-0 mt-auto">
          <Separator />
          {session && (
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 text-white border-none bg-gray-950 hover:bg-gray-950/50 hover:text-white"
              onClick={() => signOut()}
            >
              <LogOutIcon size={18} />
              <span>Logout</span>
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
