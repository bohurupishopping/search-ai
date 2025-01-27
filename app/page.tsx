"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SearchInput } from '@/components/SearchInput';
import Message from "@/components/Message";
import { WelcomeSection } from '@/components/WelcomeSection';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, PlusCircle } from 'lucide-react';
import { LoadingAnimation } from '@/components/LoadingAnimation';

interface SearchOptions {
  searchDepth: 'basic' | 'advanced';
  maxResults: number;
  topic: 'general' | 'news';
  timeRange?: 'day' | 'week' | 'month' | 'year';
  includeImages: boolean;
  includeImageDescriptions: boolean;
}

interface Message {
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    score: number;
  }>;
  images?: Array<{
    url: string;
    description?: string;
  }>;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    searchDepth: 'advanced',
    maxResults: 5,
    topic: 'general',
    includeImages: true,
    includeImageDescriptions: true
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Extract content handler
  const handleExtract = useCallback(async (url: string) => {
    if (!url || isLoading) return;

    setIsLoading(true);
    setMessages(prev => [
      ...prev,
      { type: "user", content: `Extract content from: ${url}` },
      { type: "assistant", content: "" }
    ]);

    try {
      const extractResponse = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [url] }),
      });

      if (!extractResponse.ok) {
        throw new Error("Extract failed: " + await extractResponse.text());
      }

      const extractResult = await extractResponse.json();
      const result = extractResult.results[0];

      if (result.success) {
        setMessages(prev => [
          ...prev.slice(0, -1),
          {
            type: "assistant",
            content: `# Content Extracted Successfully\n\n${result.content}\n\n## Summary\n${result.summary || 'No summary available'}`,
            images: result.images
          }
        ]);
      } else {
        throw new Error(result.error || "Failed to extract content");
      }
    } catch (error) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          type: "assistant",
          content: `Error extracting content: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Handle search function
  const handleSearch = useCallback(async (query: string, options: SearchOptions) => {
    if (!query.trim() || isLoading) return;

    setShowWelcome(false);
    setIsLoading(true);

    setMessages(prev => [
      ...prev, 
      { type: "user", content: query },
      { type: "assistant", content: "" }
    ]);
    
    try {
      const searchResponse = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query,
          options: {
            ...options,
            includeImages: true,
            includeImageDescriptions: true
          }
        }),
      });

      if (!searchResponse.ok) {
        throw new Error("Search failed: " + await searchResponse.text());
      }

      const searchResults = await searchResponse.json();

      const completionResponse = await fetch("/api/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query,
          searchResults,
        }),
      });

      if (!completionResponse.ok) {
        throw new Error("Completion failed: " + await completionResponse.text());
      }

      const reader = completionResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Failed to initialize stream reader");
      }

      let assistantMessage = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages(prev => [
          ...prev.slice(0, -1),
          { 
            type: "assistant", 
            content: assistantMessage,
            sources: searchResults.results,
            images: searchResults.images
          }
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { 
          type: "assistant", 
          content: error instanceof Error 
            ? `Sorry, I encountered an error: ${error.message}`
            : "Sorry, I encountered an unknown error while processing your request." 
        }
      ]);
    } finally {
      setIsLoading(false);
      setQuestion("");
    }
  }, [isLoading]);

  // Handle URL-based search and extract
  useEffect(() => {
    const handleUrlPatterns = async () => {
      const hash = window.location.hash;

      if (hash.startsWith('#search=')) {
        const searchTerm = decodeURIComponent(hash.slice(7));
        if (searchTerm && searchTerm !== 'undefined') {
          setShowWelcome(false);
          await handleSearch(searchTerm, searchOptions);
          window.history.replaceState({}, '', '/');
        }
      }
      else if (hash.startsWith('#extract=')) {
        const extractUrl = decodeURIComponent(hash.slice(8));
        if (extractUrl && extractUrl !== 'undefined' && isValidUrl(extractUrl)) {
          setShowWelcome(false);
          await handleExtract(extractUrl);
          window.history.replaceState({}, '', '/');
        }
      }
    };

    handleUrlPatterns();

    const handleHashChange = () => {
      handleUrlPatterns();
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleSearch, handleExtract, searchOptions]);

  // Reset chat function
  const resetChat = useCallback(() => {
    setMessages([]);
    setShowWelcome(true);
    setQuestion("");
    setIsLoading(false);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSuggestionClick = (prompt: string) => {
    handleSearch(prompt, searchOptions);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header with New Chat button */}
      <div className="flex-none w-full z-50 px-4 py-2 border-b border-neutral-200/30 dark:border-neutral-800/30 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50">
        <div className="container max-w-screen-2xl mx-auto">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-lg font-semibold bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
              AI Search Assistant
            </h1>
            <button
              onClick={resetChat}
              className={cn(
                "px-4 py-2 rounded-lg",
                "bg-neutral-100/80 hover:bg-neutral-200/80 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80",
                "text-sm font-medium text-neutral-900 dark:text-neutral-100",
                "transition-all duration-200 backdrop-blur-sm",
                "flex items-center gap-2",
                "border border-neutral-200/30 dark:border-neutral-700/30",
                "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
                "hover:border-neutral-300/50 dark:hover:border-neutral-600/50"
              )}
            >
              <PlusCircle className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
          >
            <WelcomeSection onSuggestionClick={handleSuggestionClick} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col">
          {/* Scrollable Content Container */}
          <div className={cn(
            "flex-1 overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-neutral-300/80 dark:scrollbar-thumb-neutral-700/80",
            "scrollbar-track-transparent",
            "px-4 py-6"
          )}>
            <div className="container max-w-screen-2xl mx-auto">
              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {/* User's Input */}
                    {message.type === 'user' && (
                      <div className={cn(
                        "bg-white/30 dark:bg-neutral-800/30 rounded-xl",
                        "p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200",
                        "border border-neutral-200/30 dark:border-neutral-700/30",
                        "hover:border-neutral-300/50 dark:hover:border-neutral-600/50",
                        "backdrop-blur-md"
                      )}>
                        <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
                          <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/80 backdrop-blur-sm">
                            <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="font-medium">{message.content}</p>
                        </div>
                      </div>
                    )}

                    {/* Assistant Response */}
                    {message.type === 'assistant' && (
                      <div className={cn(
                        "bg-white/30 dark:bg-neutral-800/30 rounded-xl",
                        "p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200",
                        "border border-neutral-200/30 dark:border-neutral-700/30",
                        "hover:border-neutral-300/50 dark:hover:border-neutral-600/50",
                        "backdrop-blur-md"
                      )}>
                        <AnimatePresence mode="wait">
                          {isLoading ? (
                            <LoadingAnimation className="my-8" />
                          ) : (
                            <Message
                              content={message.content}
                              type={message.type}
                              sources={message.sources}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={messagesEndRef} className="h-32" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Search Input Area */}
      <motion.div
        initial={false}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex-none w-full z-50 px-4 pb-6 pt-4",
          "bg-gradient-to-t from-neutral-100/90 via-neutral-100/80 to-transparent",
          "dark:from-neutral-900/90 dark:via-neutral-900/80 dark:to-transparent",
          "backdrop-blur-xl"
        )}
      >
        <div className="container max-w-screen-2xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <SearchInput 
              onSubmit={handleSearch}
              isLoading={isLoading}
              className="relative"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
