import React from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Newspaper, Book, Clock, Filter, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SuggestionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}

const Suggestion = ({ icon: Icon, title, description, onClick }: SuggestionProps) => (
  <motion.div
    className={cn(
      "group cursor-pointer",
      "p-1.5 sm:p-3",
      "border border-gray-200 dark:border-gray-700/50",
      "rounded-lg",
      "bg-white/50 dark:bg-gray-800/50",
      "hover:bg-white dark:hover:bg-gray-800",
      "transition-all duration-200",
      "hover:shadow-md hover:scale-[1.01]",
      "active:scale-[0.98]"
    )}
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <Icon className="w-4 h-4 text-blue-500" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

interface WelcomeSectionProps {
  onSuggestionClick: (prompt: string) => void;
}

export const WelcomeSection = ({
  onSuggestionClick
}: WelcomeSectionProps) => {
  const suggestions = [
    {
      icon: Globe,
      title: "Web Search",
      description: "Search across the entire web for accurate information",
      prompt: "What are the latest developments in artificial intelligence?"
    },
    {
      icon: Newspaper,
      title: "News Search",
      description: "Find recent news and current events",
      prompt: "What are the most significant news events from the past week?"
    },
    {
      icon: Book,
      title: "Research",
      description: "Deep dive into specific topics",
      prompt: "Explain the current understanding of dark matter in physics"
    },
    {
      icon: Clock,
      title: "Time-Based Search",
      description: "Find information from specific time periods",
      prompt: "What were the major technological breakthroughs in 2023?"
    },
    {
      icon: Filter,
      title: "Advanced Search",
      description: "Use filters for precise results",
      prompt: "Find scholarly articles about climate change from the past year"
    },
    {
      icon: Sparkles,
      title: "Trending Topics",
      description: "Discover what's popular now",
      prompt: "What are the current trending topics in technology?"
    }
  ];

  return (
    <>
      {/* Header */}
    

      {/* Welcome Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center"
          >
            <Search className="w-8 h-8 text-blue-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
          >
            Welcome to Bohurupi AI Search! 🔍
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 dark:text-gray-400 text-sm"
          >
            Get accurate, up-to-date information from across the web. What would you like to know?
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2"
        >
          {suggestions.map((suggestion, index) => (
            <Suggestion
              key={index}
              icon={suggestion.icon}
              title={suggestion.title}
              description={suggestion.description}
              onClick={() => onSuggestionClick(suggestion.prompt)}
            />
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Try one of these examples or ask your own question! 🚀
          </p>
        </motion.div>
      </motion.div>
    </>
  );
}; 