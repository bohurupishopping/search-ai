"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from '@/components/Header';
import { SearchInput } from '@/components/SearchInput';
import Message from "@/components/Message";

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-screen-2xl">
          <div className="mx-auto max-w-4xl space-y-8">
            <SearchInput 
              onSubmit={handleSearch}
              isLoading={isLoading}
            />
            
            {/* Messages section */}
            <div className="space-y-4">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  content={message.content}
                  type={message.type}
                  sources={message.sources}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
