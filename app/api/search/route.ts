import { tavily } from "@tavily/core";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  includeImageDescriptions?: boolean;
  includeRawContent?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
  extractContent?: boolean;
}

interface TavilyImage {
  url: string;
  description?: string;
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
      maxResults: 8,
      topic: 'general',
      includeImages: true,
      includeImageDescriptions: true,
      includeRawContent: true,
      extractContent: false
    };

    // Merge default options with user options
    const searchOptions = {
      ...defaultOptions,
      ...options,
      includeAnswer: true,
    };

    // Special handling for news topic
    if (searchOptions.topic === 'news') {
      searchOptions.timeRange = searchOptions.timeRange || 'month';
    }

    // Perform search with options
    const response = await tvly.search(query, searchOptions);

    // Process images if they exist
    const processedImages = response.images?.map((image: TavilyImage) => ({
      url: image.url,
      description: image.description || undefined
    })) || [];

    // If extract content is enabled, get raw content from URLs
    if (searchOptions.extractContent && response?.results?.length) {
      const urls = response.results.map(result => result.url);
      
      const extractResponse = await fetch(new URL('/api/extract', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls,
          options: {
            include_images: true,
            include_links: true,
            include_title: true,
            include_outline: true,
            summarize: true
          }
        })
      });

      if (extractResponse.ok) {
        const extractedContent = await extractResponse.json();
        
        // Merge extracted content with search results
        response.results = response.results.map(result => {
          const extracted = extractedContent.results.find(
            (ext: any) => ext.url === result.url && ext.success
          );
          
          if (extracted) {
            // Add any extracted images to our images array
            if (extracted.images?.length) {
              processedImages.push(
                ...extracted.images.map((url: string) => ({
                  url,
                  description: result.title
                }))
              );
            }

            return {
              ...result,
              content: extracted.content,
              rawContent: extracted.content,
              summary: extracted.summary,
              outline: extracted.outline
            };
          }
          return result;
        });
      }
    }

    // Validate and format results
    if (!response?.results?.length) {
      return NextResponse.json(
        { error: "No results found" },
        { status: 404 }
      );
    }

    // Format and clean the results
    const cleanResults = response.results
      .map(result => ({
        title: result.title || "",
        url: result.url || "",
        content: result.content?.trim() || "",
        rawContent: result.rawContent?.trim() || "",
        score: result.score || 0,
        publishedDate: result.publishedDate,
      }))
      .filter(result => result.content && result.title)
      .map(result => ({
        ...result,
        content: result.content.length < 200 && result.rawContent 
          ? result.rawContent.slice(0, 1000) 
          : result.content
      }));

    // Sort results by score and relevance
    cleanResults.sort((a, b) => {
      const scoreDiff = (b.score || 0) - (a.score || 0);
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      return b.content.length - a.content.length;
    });

    return NextResponse.json({
      results: cleanResults,
      images: processedImages,
      responseTime: response.responseTime,
      topic: searchOptions.topic,
      searchDepth: searchOptions.searchDepth,
      answer: response.answer,
      extractedContent: searchOptions.extractContent
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