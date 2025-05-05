"use client";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "./landing-header";
import { motion } from "framer-motion";
import { LandingTextBox } from "./Landing-textbox";

export default function Landing() {
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const badgeVariants = {
    initial: { y: -20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const promptBoxVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.6,
      },
    },
  };

  const floatingBlob = {
    animate: {
      scale: [1, 1.1, 0.9, 1],
      x: [0, 30, -20, 0],
      y: [0, -50, 20, 0],
      transition: {
        duration: 7,
        repeat: Infinity,
        repeatType: "loop",
      },
    },
  };

  const floatingBlobDelayed = {
    animate: {
      scale: [1, 0.9, 1.1, 1],
      x: [0, -20, 30, 0],
      y: [0, 20, -50, 0],
      transition: {
        duration: 7,
        repeat: Infinity,
        repeatType: "loop",
        delay: 2,
      },
    },
  };

  const pulseVariant = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
      },
    },
  };

  const gradientVariant = {
    animate: {
      x: ["-100%", "100%"],
      transition: {
        duration: 8,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
      },
    },
  };

  return (
    <motion.main
      className="min-h-screen bg-gray-950"
      initial="initial"
      animate="animate"
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <LandingHeader />
        </motion.div>

        {/* Announcement Banner with animation */}
        <div className="flex justify-center mb-14">
          <motion.div variants={badgeVariants}>
            <Badge
              variant="outline"
              className="py-2 px-4 border-gray-900 bg-gray-900/10 text-blue-200 flex items-center gap-2 rounded-full"
            >
              <motion.span
                variants={pulseVariant}
                animate="animate"
                className="text-white"
              >
                ⚡
              </motion.span>{" "}
              Early Access
            </Badge>
          </motion.div>
        </div>

        {/* Hero Section with animations */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-6xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-400 via-gray-500 to-gray-700"
          >
            Turn your thoughts into animations
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-md md:text-md text-gray-400 max-w-3xl mb-12"
          >
            Prompt, design, animate, and share stunning animations powered by AI
            technology. Looma makes animation creation accessible to everyone.
          </motion.p>

          <motion.div
            variants={promptBoxVariants}
            className="relative w-full max-w-3xl rounded-xl overflow-hidden mb-12"
          >
            <div className="bg-gradient-to-r from-gray-900/20 to-gray-800/20 rounded-xl p-6 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-30">
                <motion.div
                  variants={gradientVariant}
                  animate="animate"
                  className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/0 via-gray-600/20 to-blue-600/0"
                ></motion.div>

                <motion.div
                  variants={floatingBlob}
                  animate="animate"
                  className="absolute -top-32 -left-32 w-64 h-64 bg-gray-500/20 rounded-full blur-3xl"
                ></motion.div>

                <motion.div
                  variants={floatingBlobDelayed}
                  animate="animate"
                  className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-700/20 rounded-full blur-3xl"
                ></motion.div>
              </div>
              <div className="flex flex-row">
                <LandingTextBox />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}
