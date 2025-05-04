"use client";
import React, { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

export default function SignupForm() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Handle Google sign in
  const handleGoogleSignIn = () => {
    setIsLoggingIn(true);
    // Start Google sign-in and redirect to onboarding on success
    signIn("google", { 
      callbackUrl: "/" // Redirect to onboarding page after login
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleGoogleSignIn();
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-xl p-6 md:p-8 shadow-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700">
      {/* Logo/Brand Mark */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white text-2xl font-bold">CQ</span>
        </div>
      </div>

      <h2 className="font-bold text-2xl text-gray-800 dark:text-white text-center">
        Welcome to InstructAI
      </h2>
      
      <p className="text-gray-500 text-sm max-w-sm mt-2 dark:text-gray-400 text-center mx-auto">
        Get started with InstructAI
      </p>

      <form className="mt-8" onSubmit={handleSubmit}>
        {/* Decorative Wave Element */}
        <div className="relative py-3 flex items-center justify-center mb-4">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          <div className="absolute px-3 bg-white dark:bg-zinc-900">
            <span className="text-sm text-gray-500 dark:text-gray-400">Continue with</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            className="relative w-full group flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 
                     bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 
                     text-gray-700 dark:text-gray-300 font-medium
                     border border-gray-200 dark:border-zinc-700
                     shadow-sm hover:shadow-md"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoggingIn}
          >
            <div className="flex items-center">
              <FcGoogle className="w-5 h-5 mr-3" />
              <span>{isLoggingIn ? "Signing in..." : "Sign in with Google"}</span>
            </div>
          </Button>
        </div>

        {/* Future Options Note */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-8">
          More sign-in options coming soon
        </p>
      </form>

      {/* Bottom decorative element */}
      <div className="mt-10 pt-4 border-t border-gray-100 dark:border-zinc-800">
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          By signing in, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}