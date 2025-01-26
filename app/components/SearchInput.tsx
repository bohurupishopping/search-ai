import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { Search, Loader2, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import SearchOptions from './SearchOptions';

interface SearchOptions {
  searchDepth: 'basic' | 'advanced';
  maxResults: number;
  topic: 'general' | 'news';
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

interface SearchInputProps {
  onSubmit: (query: string, options: SearchOptions) => void;
  isLoading?: boolean;
  className?: string;
}

export const SearchInput = ({ onSubmit, isLoading, className }: SearchInputProps) => {
  const [query, setQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    searchDepth: 'basic',
    maxResults: 5,
    topic: 'general'
  });
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim(), searchOptions);
    }
  }, [query, searchOptions, onSubmit]);

  const adjustHeight = useCallback(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = '44px';
    const scrollHeight = inputRef.current.scrollHeight;
    const newHeight = Math.min(Math.max(44, scrollHeight), 200);
    if (scrollHeight > 44) {
      inputRef.current.style.height = `${newHeight}px`;
      inputRef.current.style.overflowY = newHeight >= 200 ? 'auto' : 'hidden';
    } else {
      inputRef.current.style.height = '44px';
      inputRef.current.style.overflowY = 'hidden';
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={cn("w-full max-w-4xl mx-auto px-2", className)}
    >
      <motion.form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex items-center gap-2",
          "rounded-[20px]",
          "p-2 pr-2.5",
          "transition-all duration-300 ease-out",
          "backdrop-blur-md",
          isFocused ? [
            "bg-white/95 dark:bg-gray-800/95",
            "border border-blue-200/50 dark:border-blue-800/30",
            "shadow-lg shadow-blue-500/5 dark:shadow-blue-500/3",
            "ring-[1px] ring-blue-100 dark:ring-blue-900/30"
          ] : [
            "bg-gray-50/90 dark:bg-gray-800/90",
            "border border-gray-200/50 dark:border-gray-700/30",
            "hover:border-gray-300/50 dark:hover:border-gray-600/30",
            "hover:bg-white/95 dark:hover:bg-gray-800/95",
            "shadow-md shadow-black/[0.03] dark:shadow-black/[0.05]"
          ],
          "transform-gpu"
        )}
      >
        {/* Action Buttons */}
        <motion.div 
          className="flex items-center gap-2 pl-1"
          initial={false}
          animate={isFocused ? { opacity: 1 } : { opacity: 0.8 }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full",
              "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              "hover:bg-gray-100/80 dark:hover:bg-gray-700/80",
              "transition-all duration-200 ease-out",
              showOptions && "text-blue-500 hover:text-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
            )}
            onClick={() => setShowOptions(!showOptions)}
          >
            <Settings2 className="w-[18px] h-[18px]" />
          </Button>
        </motion.div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask me anything..."
            className={cn(
              "w-full min-h-[44px] max-h-[200px] py-2.5 px-2",
              "bg-transparent",
              "border-0 outline-0 focus:outline-0 ring-0 focus:ring-0 focus:ring-offset-0",
              "resize-none",
              "text-gray-700 dark:text-gray-200",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "transition-colors duration-200",
              "text-[15px] leading-relaxed",
              "[&::-webkit-scrollbar]:hidden",
              "[-ms-overflow-style:none]",
              "[scrollbar-width:none]"
            )}
            style={{ 
              height: '44px',
              boxShadow: 'none',
              outline: 'none',
              overflow: 'hidden'
            }}
          />
        </div>

        {/* Search Button */}
        <motion.div 
          initial={false}
          animate={isFocused ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 0.9 }}
        >
          <Button 
            type="submit"
            disabled={!query.trim() || isLoading}
            className={cn(
              "h-9 w-9",
              "bg-gradient-to-br from-blue-500 to-blue-600",
              "hover:from-blue-600 hover:to-blue-700",
              "text-white",
              "rounded-full",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "disabled:hover:from-blue-500 disabled:hover:to-blue-600",
              "transition-all duration-200",
              "flex items-center justify-center",
              "group",
              "shadow-md shadow-blue-500/20",
              "hover:shadow-lg hover:shadow-blue-500/30",
              "active:scale-95",
              "transform-gpu"
            )}
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
              className="flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin" />
              ) : (
                <Search 
                  className="w-[18px] h-[18px] group-hover:scale-105
                    transition-transform duration-200" 
                  strokeWidth={2.5}
                />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </motion.form>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            <SearchOptions
              options={searchOptions}
              onChange={setSearchOptions}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 