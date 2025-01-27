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
    }, 1500); // Faster text transitions

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col items-center justify-center p-6 sm:p-8",
        "bg-neutral-50/20 dark:bg-neutral-800/20",
        "rounded-xl border border-neutral-200/30 dark:border-neutral-700/30",
        "backdrop-blur-sm",
        "hover:shadow-lg transition-all duration-200",
        "hover:border-neutral-300/40 dark:hover:border-neutral-600/40",
        className
      )}
    >
      {/* Animated Icons */}
      <div className="relative w-16 h-16 mb-4">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 1.5, // Faster rotation
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        >
          <Search className="w-8 h-8 text-blue-500/90" />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0.8, 1.05, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        >
          <div className="w-full h-full rounded-full border-2 border-blue-500/30" />
        </motion.div>
        {/* Orbiting Elements */}
        {[Globe, Sparkles, Zap].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute"
            animate={{
              rotate: [0, 360],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2, // Faster orbit delays
              ease: "linear",
              times: [0, 0.5, 1],
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
            <Icon className="w-6 h-6 text-blue-500/60" />
          </motion.div>
        ))}
      </div>

      {/* Loading Text */}
      <motion.div
        className="text-center"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.p
          key={textIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium bg-gradient-to-r from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent"
        >
          {loadingTexts[textIndex]}
        </motion.p>
        <div className="flex items-center gap-1.5 mt-2 justify-center">
          {[0, 0.15, 0.3].map((delay, index) => (
            <motion.div
              key={index}
              className="w-1 h-1 rounded-full bg-blue-500/70"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.6, // Faster dot animation
                repeat: Infinity,
                delay,
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
