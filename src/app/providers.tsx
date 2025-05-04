"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

type Props = {
  children: React.ReactNode;
  session: Session | null;
};
export const Providers = ({ children, session }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};
