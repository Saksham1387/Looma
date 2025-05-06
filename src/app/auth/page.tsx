"use client";
import { LandingHeader } from "@/components/landing-header";
import SignupForm from "@/components/signin-form";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Auth() {
  const { data: session } = useSession();
  const router = useRouter();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (session) {
    router.push("/");
  }
  return (
    <div className="bg-[#0f0f0f] h-full">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-5 px-24"
        transition={{ duration: 0.6 }}
      >
        <LandingHeader />
      </motion.div>

      <motion.div
        className="items-center justify-center bg-[#0f0f0f] h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className=""
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <SignupForm />
        </motion.div>
      </motion.div>
    </div>
  );
}