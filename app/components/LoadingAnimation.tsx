import React from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  className?: string;
}

const loadingTexts = [
  "Searching the web...",
  "Analyzing sources...",
  "Processing information...",
  "Generating response...",
];

export const LoadingAnimation = ({ className }: LoadingAnimationProps) => {
  const [textIndex, setTextIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex flex-col items-center justify-center p-8",
        "bg-white/50 dark:bg-neutral-800/50",
        "rounded-xl border border-neutral-200 dark:border-neutral-700",
        "backdrop-blur-sm",
        className
      )}
    >
      {/* Animated Icons */}
      <div className="relative w-16 h-16 mb-4">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Search className="w-8 h-8 text-blue-500" />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full rounded-full border-2 border-blue-500/50" />
        </motion.div>
        {/* Orbiting Elements */}
        {[Globe, Sparkles, Zap].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "linear",
            }}
            style={{
              originX: 0.5,
              originY: 0.5,
              left: "50%",
              top: "50%",
              marginLeft: -12,
              marginTop: -12,
            }}
          >
            <Icon className="w-6 h-6 text-blue-500/70" />
          </motion.div>
        ))}
      </div>

      {/* Loading Text */}
      <motion.div
        className="text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.p
          key={textIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
        >
          {loadingTexts[textIndex]}
        </motion.p>
        <div className="flex items-center gap-1 mt-2 justify-center">
          <motion.div
            className="w-1 h-1 rounded-full bg-blue-500"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="w-1 h-1 rounded-full bg-blue-500"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.2,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="w-1 h-1 rounded-full bg-blue-500"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.4,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}; 