import { tavily } from "@tavily/core";
import { NextResponse } from "next/server";

export const runtime = "edge";

if (!process.env.TAVILY_API_KEY) {
  throw new Error("TAVILY_API_KEY is not configured");
}

// Initialize Tavily client
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

interface SearchOptions {
  searchDepth?: 'basic' | 'advanced';
  maxResults?: number;
  topic?: 'general' | 'news';
  timeRange?: 'day' | 'week' | 'month' | 'year';
  includeImages?: boolean;
  includeRawContent?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
}

export async function POST(req: Request) {
  try {
    const { query, options = {} } = await req.json();

    // Validate input
    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Default search options for more comprehensive results
    const defaultOptions: SearchOptions = {
      searchDepth: 'advanced',
      maxResults: 8, // Increased from 5
      topic: 'general',
      includeImages: false,
      includeRawContent: true, // Get full content
    };

    // Merge default options with user options
    const searchOptions = {
      ...defaultOptions,
      ...options,
      // Force some options for better results
      searchDepth: 'advanced', // Always use advanced search
      includeAnswer: true, // Get AI-generated answer
    };

    // Special handling for news topic
    if (searchOptions.topic === 'news') {
      searchOptions.timeRange = searchOptions.timeRange || 'month'; // Default to last month for more context
    }

    // Perform search with options
    const response = await tvly.search(query, searchOptions);

    // Validate and format results
    if (!response?.results?.length) {
      return NextResponse.json(
        { error: "No results found" },
        { status: 404 }
      );
    }

    // Format and clean the results, keeping more content
    const cleanResults = response.results
      .map(result => ({
        title: result.title || "",
        url: result.url || "",
        content: result.content?.trim() || "",
        rawContent: result.rawContent?.trim() || "", // Include raw content if available
        score: result.score || 0,
        publishedDate: result.publishedDate,
      }))
      .filter(result => result.content && result.title)
      // Ensure minimum content length
      .map(result => ({
        ...result,
        // Use raw content if regular content is too short
        content: result.content.length < 200 && result.rawContent 
          ? result.rawContent.slice(0, 1000) 
          : result.content
      }));

    // Sort results by score and relevance
    cleanResults.sort((a, b) => {
      // Prioritize results with higher scores
      const scoreDiff = (b.score || 0) - (a.score || 0);
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      
      // For similar scores, prefer longer content
      return b.content.length - a.content.length;
    });

    return NextResponse.json({
      results: cleanResults,
      responseTime: response.responseTime,
      topic: searchOptions.topic,
      searchDepth: searchOptions.searchDepth,
      answer: response.answer, // Include Tavily's AI answer
    });
  } catch (error) {
    console.error("Tavily search error:", error);
    return NextResponse.json(
      { 
        error: "Failed to perform search",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 