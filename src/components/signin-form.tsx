"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";

export default function SignupForm() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoggingIn(true);

    signIn("google", {
      callbackUrl: "/",
    });
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-xl md:p-8 shadow-lg bg-gray-900 border border-gray-950">
      {/* Logo/Brand Mark */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gray-950 rounded-xl flex items-center justify-center shadow-md">
          <Film className="text-white" />
        </div>
      </div>

      <h2 className="font-bold text-2xl text-white text-center">
        Welcome to Looma
      </h2>

      <p className="text-gray-400 text-sm max-w-sm mt-2 text-center mx-auto">
        Get started with Looma
      </p>

      <div className="mt-8">
        {/* Decorative Wave Element */}
        <div className="relative py-3 flex items-center justify-center mb-4">
          <div className="w-full border-t border-gray-950"></div>
          <div className="absolute px-3 bg-gray-900">
            <span className="text-sm text-gray-400">Continue with</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            className="relative w-full group flex items-center justify-center py-3 px-4 rounded-lg transition-all  cursor-pointer duration-200 
                     bg-gray-950 hover:bg-gray-900
                     text-gray-300 font-medium
                     border border-gray-950
                     shadow-sm hover:shadow-md"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoggingIn}
          >
            <div className="flex items-center ">
              <FcGoogle className="w-5 h-5 mr-3" />
              <span>
                {isLoggingIn ? "Signing in..." : "Sign in with Google"}
              </span>
            </div>
          </Button>
        </div>

        {/* Future Options Note */}
        <p className="text-xs text-center text-gray-400 mt-8">
          More sign-in options coming soon
        </p>
      </div>

      {/* Bottom decorative element */}
      <div className="mt-10 pt-4 border-t border-gray-950">
        <p className="text-xs text-center text-gray-500">
          By signing in, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}
