import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";

export const ChatHeader = () => {
  const { data: session } = useSession();
  return (
    <div className="p-3 sticky top-0 z-10 bg-[#0f0f0f] backdrop-blur-sm px-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="cursor-pointer">
          <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <Image src="/logo (1).png" alt="logo" width={20} height={20} />
            <span>Looma</span>
          </h1>
        </Link>
        {session && (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex flex-row gap-5">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={session.user.image!} alt="user_image" />
                  <AvatarFallback>{session.user.name}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0f0f0f] text-white border-none">
                <DropdownMenuLabel className="text-sm bg-neutral-950 rounded-lg">
                  {session.user?.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-800 rounded-lg" />
                <DropdownMenuGroup className="bg-neutral-950  rounded-lg">
                  <DropdownMenuItem className="bg-[#0f0f0f] focus:bg-neutral-950 rounded-b-lg">
                    <button
                      className="w-full text-left text-sm cursor-pointer bg-[#0f0f0f] p-2 text-white hover:bg-[#0f0f0f] rounded"
                      onClick={() => {
                        signOut();
                      }}
                    >
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};
