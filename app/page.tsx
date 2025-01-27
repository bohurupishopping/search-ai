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

    // Hide welcome section when search starts
    setShowWelcome(false);
    setIsLoading(true);

    // Add user message
    setMessages(prev => [
      ...prev, 
      { type: "user", content: query },
      // Add an empty assistant message immediately to show loading state
      { type: "assistant", content: "" }
    ]);
    
    try {
      // First, get search results from Tavily
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

      // Then, stream the AI completion
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

      // Initialize streaming
      const reader = completionResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Failed to initialize stream reader");
      }

      let assistantMessage = "";
      
      // Process the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        // Update the last message (which is the assistant's message)
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
        ...prev.slice(0, -1), // Remove the loading message
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

      // Handle search pattern from hash
      if (hash.startsWith('#search=')) {
        const searchTerm = decodeURIComponent(hash.slice(7));
        if (searchTerm && searchTerm !== 'undefined') {
          setShowWelcome(false);
          await handleSearch(searchTerm, searchOptions);
          // Clean up URL after processing
          window.history.replaceState({}, '', '/');
        }
      }
      // Handle extract pattern
      else if (hash.startsWith('#extract=')) {
        const extractUrl = decodeURIComponent(hash.slice(8)); // Fix: changed from 9 to 8
        if (extractUrl && extractUrl !== 'undefined' && isValidUrl(extractUrl)) {
          setShowWelcome(false);
          await handleExtract(extractUrl);
          // Clean up URL after processing
          window.history.replaceState({}, '', '/');
        }
      }
    };

    // Initial check for URL patterns
    handleUrlPatterns();

    // Add event listener for hash changes
    const handleHashChange = () => {
      handleUrlPatterns();
    };
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup
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
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      {/* Header with New Chat button */}
      <div className="flex-none w-full z-50 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="container max-w-screen-2xl mx-auto">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">AI Search Assistant</h1>
            <button
              onClick={resetChat}
              className={cn(
                "px-4 py-2 rounded-lg",
                "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700",
                "text-sm font-medium text-neutral-900 dark:text-neutral-100",
                "transition-colors duration-200",
                "flex items-center gap-2",
                "border border-neutral-200 dark:border-neutral-700"
              )}
            >
              <PlusCircle className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Section (includes Header) */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-0 z-10 bg-white dark:bg-neutral-900"
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
            "scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700",
            "scrollbar-track-transparent",
            "px-4 py-6"
          )}>
            <div className="container max-w-screen-2xl mx-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {/* Section 1: User's Input */}
                    {message.type === 'user' && (
                      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="font-medium">{message.content}</p>
                        </div>
                      </div>
                    )}

                    {/* Assistant Response Container */}
                    {message.type === 'assistant' && (
                      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
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

      {/* Search Input Area - Fixed at bottom */}
      <motion.div
        initial={false}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex-none w-full z-50 px-4 pb-6 pt-4",
          "bg-gradient-to-t from-neutral-50 via-neutral-50 to-transparent",
          "dark:from-neutral-900 dark:via-neutral-900 dark:to-transparent",
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
