import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Zap, Clock, Filter, Layers, Target, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface SearchOptionsProps {
  options: {
    searchDepth: 'basic' | 'advanced';
    maxResults: number;
    topic: 'general' | 'news';
    timeRange?: 'day' | 'week' | 'month' | 'year';
    extractContent?: boolean;
    includeImages?: boolean;
  };
  onChange: (options: any) => void;
}

const OptionTooltip = ({ content, children }: { content: string, children: React.ReactNode }) => (
  <TooltipProvider>
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        className="bg-white/95 dark:bg-neutral-800/95 border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg"
        sideOffset={5}
      >
        <p className="text-xs text-neutral-700 dark:text-neutral-300">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function SearchOptions({ options, onChange }: SearchOptionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-white/95 dark:bg-neutral-800/95",
        "backdrop-blur-lg",
        "rounded-xl",
        "border border-neutral-200/50 dark:border-neutral-700/50",
        "shadow-lg shadow-neutral-500/5",
        "p-4 space-y-6"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-500" />
          Search Options
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={() => onChange({
            searchDepth: 'basic',
            maxResults: 5,
            topic: 'general'
          })}
        >
          Reset
        </motion.button>
      </div>
      
      <div className="grid gap-4">
        {/* Search Depth */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Search Depth
            </label>
            <OptionTooltip content="Advanced search provides more comprehensive results but may take longer">
              <Info className="w-3.5 h-3.5 text-neutral-400 cursor-help" />
            </OptionTooltip>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['basic', 'advanced'].map((depth) => (
              <motion.button
                key={depth}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ ...options, searchDepth: depth })}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium",
                  "transition-all duration-200",
                  "border border-neutral-200 dark:border-neutral-700",
                  options.searchDepth === depth
                    ? "bg-blue-500 text-white border-transparent"
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
                  "hover:shadow-md"
                )}
              >
                {depth.charAt(0).toUpperCase() + depth.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Max Results */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Max Results
            </label>
            <OptionTooltip content="Higher values provide more results but may increase response time">
              <Info className="w-3.5 h-3.5 text-neutral-400 cursor-help" />
            </OptionTooltip>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={options.maxResults}
              onChange={(e) => onChange({ ...options, maxResults: Number(e.target.value) })}
              className={cn(
                "w-full h-2 rounded-full appearance-none",
                "bg-neutral-200 dark:bg-neutral-700",
                "cursor-pointer",
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:w-4",
                "[&::-webkit-slider-thumb]:h-4",
                "[&::-webkit-slider-thumb]:rounded-full",
                "[&::-webkit-slider-thumb]:bg-blue-500",
                "[&::-webkit-slider-thumb]:cursor-pointer",
                "[&::-webkit-slider-thumb]:transition-transform",
                "[&::-webkit-slider-thumb]:duration-200",
                "[&::-webkit-slider-thumb]:hover:scale-110"
              )}
            />
            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 text-center">
              {options.maxResults} result{options.maxResults !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Topic
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['general', 'news'].map((topic) => (
              <motion.button
                key={topic}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ ...options, topic })}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium",
                  "transition-all duration-200",
                  "border border-neutral-200 dark:border-neutral-700",
                  options.topic === topic
                    ? "bg-blue-500 text-white border-transparent"
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
                  "hover:shadow-md"
                )}
              >
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Extract Content Option */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Content Extraction
            </label>
            <OptionTooltip content="Extract raw content from search results for more detailed analysis">
              <Info className="w-3.5 h-3.5 text-neutral-400 cursor-help" />
            </OptionTooltip>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: false, label: 'Basic' },
              { value: true, label: 'Extract Raw' }
            ].map((option) => (
              <motion.button
                key={option.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ ...options, extractContent: option.value })}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium",
                  "transition-all duration-200",
                  "border border-neutral-200 dark:border-neutral-700",
                  options.extractContent === option.value
                    ? "bg-blue-500 text-white border-transparent"
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
                  "hover:shadow-md"
                )}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Time Range (only for news topic) */}
        <AnimatePresence>
          {options.topic === 'news' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Time Range
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['day', 'week', 'month', 'year'].map((range) => (
                  <motion.button
                    key={range}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onChange({ ...options, timeRange: range })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium",
                      "transition-all duration-200",
                      "border border-neutral-200 dark:border-neutral-700",
                      options.timeRange === range
                        ? "bg-blue-500 text-white border-transparent"
                        : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
                      "hover:shadow-md"
                    )}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-700"
      >
        <p className="font-medium text-neutral-700 dark:text-neutral-300">Tips:</p>
        <ul className="space-y-1.5 text-neutral-500 dark:text-neutral-400">
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-500" />
            Advanced depth provides more comprehensive results
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-500" />
            News topic includes recent articles only
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-500" />
            Higher max results may increase response time
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
} 