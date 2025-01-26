import { tavily } from "@tavily/core";
import { NextResponse } from "next/server";

export const runtime = "edge";

if (!process.env.TAVILY_API_KEY) {
  throw new Error("TAVILY_API_KEY is not configured");
}

// Initialize Tavily client
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

interface ExtractOptions {
  include_images?: boolean;
  include_links?: boolean;
  include_html?: boolean;
  include_title?: boolean;
  include_outline?: boolean;
  max_pages?: number;
  summarize?: boolean;
  summary_length?: 'short' | 'medium' | 'long';
}

// Define the expected response structure from Tavily Extract API
interface TavilyExtractResult {
  results: {
    url: string;
    rawContent: string;
    title?: string;
    content?: string;
    summary?: string;
    outline?: string[];
    links?: string[];
    images?: string[];
  }[];
  failedResults?: {
    url: string;
    error: string;
  }[];
  responseTime: number;
}

// Define our processed result structure
interface ProcessedExtractResult {
  url: string;
  title?: string;
  content?: string;
  summary?: string;
  outline?: string[];
  links?: string[];
  images?: string[];
  success: boolean;
  error?: string;
}

export async function POST(req: Request) {
  try {
    const { urls, options = {} } = await req.json();

    // Validate input
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "URLs array is required" },
        { status: 400 }
      );
    }

    // Default extract options for better results
    const defaultOptions: ExtractOptions = {
      include_images: false,
      include_links: true,
      include_html: false,
      include_title: true,
      include_outline: true,
      max_pages: 3,
      summarize: true,
      summary_length: 'medium'
    };

    // Merge default options with user options
    const extractOptions = {
      ...defaultOptions,
      ...options
    };

    // Extract content from multiple URLs
    const extractPromises = urls.map(async (url): Promise<ProcessedExtractResult> => {
      try {
        // Call extract with a single URL (Tavily processes one URL at a time)
        const result = await tvly.extract(url) as TavilyExtractResult;
        const extractedResult = result.results[0];

        if (!extractedResult) {
          throw new Error('No content extracted');
        }

        return {
          url,
          title: extractedResult.title,
          content: extractedResult.content || extractedResult.rawContent,
          summary: extractedResult.summary,
          outline: extractedResult.outline,
          links: extractedResult.links,
          images: extractedResult.images,
          success: true
        };
      } catch (error) {
        return {
          url,
          error: error instanceof Error ? error.message : 'Failed to extract content',
          success: false
        };
      }
    });

    // Wait for all extractions to complete
    const results = await Promise.all(extractPromises);

    return NextResponse.json({
      results,
      totalProcessed: urls.length,
      successfulExtractions: results.filter(r => r.success).length
    });

  } catch (error) {
    console.error("Tavily extract error:", error);
    return NextResponse.json(
      { 
        error: "Failed to extract content",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 