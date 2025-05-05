import { Film } from "lucide-react";
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
export const ChatHeader = () => {
  const { data: session } = useSession();
  return (
    <div className="p-6 border-b border-slate-800 sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <Link href="/" className="cursor-pointer">
          <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <Film className="text-slate-400" />
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
        )}
      </div>
    </div>
  );
};
