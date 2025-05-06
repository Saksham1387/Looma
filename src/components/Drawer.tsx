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
  LogInIcon,
  LogOutIcon,
  MessageCircleMore,
  PlusCircleIcon,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Separator } from "./ui/separator";

const DRAWER_WIDTH = 250;

type TChat = {
  id: string;
  name: string;
  description: string;
};

export function ChatsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [chats, setChats] = useState<TChat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("/api/project");
        const data = res.data;
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
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="bg-[#111111] border border-[#222222] rounded-md p-3 animate-pulse flex justify-between items-center"
        >
          <div className="h-4 bg-[#222222] rounded w-3/4"></div>
          <div className="h-5 w-5 bg-[#222222] rounded"></div>
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
        className="bg-[#0C0C0C] text-white border-r border-[#222222]"
      >
        <DrawerHeader className="p-4 pb-0 flex flex-col h-auto">
          <div className="flex flex-row items-center gap-2 border border-none rounded-md p-3">
            <Image src="/logo (1).png" alt="logo" width={20} height={20} />
            <div className="text-lg font-bold">Looma</div>
          </div>
          <Separator />
          {session ? (
            <div className="py-3">
              <Button
                variant="ghost"
                className="w-full flex bg-[#111111] items-center gap-2 text-gray-400 hover:text-teal-400 hover:bg-[#111111] cursor-pointer justify-start px-3 h-10"
                onClick={() => {
                  router.push("/");
                }}
              >
                <PlusCircleIcon size={18} />
                <span>New Chat</span>
              </Button>
            </div>
          ) : null}
        </DrawerHeader>

        {/* Scrollable chats section */}
        <div className="flex-1 overflow-y-auto p-4 pt-2">
          {session ? (
            loading ? (
              <ChatSkeleton />
            ) : chats && chats.length > 0 ? (
              <div className="space-y-2">
                {chats.map((chat, index) => (
                  <Link key={index} href={`/chat/${chat.id}`}>
                    <div className="hover:bg-[#111111] rounded-md p-3 text-sm hover:border-[#333333] transition-colors flex justify-between items-center cursor-pointer group">
                      <span className="text-gray-400 group-hover:text-white truncate max-w-[170px]">
                        {chat.description}
                      </span>
                      <MessageCircleMore className="h-4 w-4 text-gray-500 group-hover:text-teal-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#111111] border border-[#222222] rounded-md p-4 text-center">
                <p className="text-sm text-gray-500">No chats yet</p>
                <p className="text-xs text-gray-600 mt-1">
                  Start a new conversation
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-4 mt-2 bg-[#111111] border border-[#222222] rounded-md p-5">
              <p className="text-sm text-gray-400">
                Please login to access chats
              </p>
              <Link href="/auth">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-400 hover:text-teal-400 hover:bg-[#111111] bg-transparent"
                >
                  <LogInIcon size={16} />
                  <span>Login</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        <DrawerFooter className="p-4 pt-0 mt-0 border-t border-[#222222]">
          {session && (
            <Button
              variant="ghost"
              className="w-full flex items-center gap-2 text-gray-400 hover:text-teal-400 hover:bg-[#111111] bg-transparent justify-start px-3 h-10"
              onClick={() => signOut()}
            >
              <LogOutIcon size={16} />
              <span>Logout</span>
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
