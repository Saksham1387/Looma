"use client";
import { Button } from "./ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import Image from "next/image";

export const LandingHeader = () => {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <header className="flex justify-between items-center bg-neutral-950 mb-12  rounded-2xl py-4 p-3 border border-[#222222] ">
      <Link href={"/"}>
        <div className="flex items-center gap-2 flex-row">
          <div className="h-10 w-10 rounded-full  flex items-center justify-center">
           <Image src="/logo (1).png" alt="logo" width={30} height={30} /> 
          </div>

          <h1 className="text-2xl font-bold text-white ">Looma</h1>
        </div>
      </Link>
      <div className="flex gap-4 ">
        {session ? (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex flex-row gap-5">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={session.user.image!} alt="user_image" />
                  <AvatarFallback>{session.user.name}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 text-white border-none">
                <DropdownMenuLabel className="text-sm bg-gray-900">
                  {session.user?.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuGroup className="bg-gray-900">
                  <DropdownMenuItem className="bg-gray-900  focus:bg-gray-900">
                    <button
                      className="w-full text-left text-sm cursor-pointer bg-gray-950 p-2 text-white hover:bg-gray-950 rounded"
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
        ) : (
          <Button
            className=" hover:text-teal-400 cursor-pointer"
            onClick={() => router.push("/auth")}
          >
            Signin
          </Button>
        )}
      </div>
    </header>
  );
};
