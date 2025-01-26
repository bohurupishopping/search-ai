"use client";

import { useState, useRef, useEffect } from "react";
import { SearchInput } from '@/components/SearchInput';
import Message from "@/components/Message";
import { WelcomeSection } from '@/components/WelcomeSection';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { LoadingAnimation } from '@/components/LoadingAnimation';

interface SearchOptions {
  searchDepth: 'basic' | 'advanced';
  maxResults: number;
  topic: 'general' | 'news';
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

interface Message {
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    score: number;
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
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearch = async (query: string, options: SearchOptions) => {
    if (!query.trim() || isLoading) return;

    // Hide welcome section when search starts
    setShowWelcome(false);

    // Add user message
    setMessages(prev => [...prev, { type: "user", content: query }]);
    setIsLoading(true);
    
    try {
      // First, get search results from Tavily
      const searchResponse = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query,
          options
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

      // Add initial assistant message
      setMessages(prev => [...prev, { 
        type: "assistant", 
        content: "",
        sources: searchResults.results
      }]);

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
            sources: searchResults.results
          }
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
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
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSearch(prompt, searchOptions);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900">
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
