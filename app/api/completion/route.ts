import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Validate API key
if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not configured");
}

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Helper function to truncate context
function truncateContext(results: any[], maxResults = 4) {
  // Sort by score and take top N results
  const topResults = results
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, maxResults);

  // Keep more content for better context
  return topResults.map(result => ({
    ...result,
    content: result.content.split(' ').slice(0, 300).join(' ')
  }));
}

export async function POST(req: Request) {
  try {
    const { query, searchResults, language = 'standard' } = await req.json();

    // Validate input
    if (!query || !searchResults?.results) {
      return NextResponse.json(
        { error: "Invalid request: Missing query or search results" },
        { status: 400 }
      );
    }

    // Get Tavily's AI answer if available
    const tavilyAnswer = searchResults.answer;

    // Truncate context to manage token limit
    const truncatedResults = truncateContext(searchResults.results, 3);

    // Create context from truncated results with metadata
    const context = truncatedResults
      .map((result: any, index) => 
        `[Source ${index + 1}](${result.url})
Title: ${result.title}
Relevance Score: ${Math.round(result.score * 100)}%
Content: ${result.content}`
      )
      .join("\n\n");

    // Language style adaptation
    const languageStyle = language === 'indian' 
      ? "Use Indian English style with appropriate idioms and expressions while maintaining professionalism."
      : "Use standard professional English.";

    // Create the system prompt for more intelligent responses
    const systemPrompt = `You are an advanced AI research assistant with expertise in web search analysis and information synthesis.

RESPONSE GUIDELINES:
1. ANALYSIS & SYNTHESIS:
   - Analyze information critically from multiple sources
   - Identify key patterns and insights
   - Prioritize recent and authoritative sources
   - Cross-reference facts for accuracy

2. CONTENT BALANCE:
   - Provide comprehensive yet concise answers
   - Focus on most relevant information
   - Include specific facts and data points
   - Remove redundant information
   - Balance depth with readability

3. STRUCTURE & FORMAT:
   - Start with a brief overview
   - Use clear headings for sections
   - Include bullet points for key facts
   - Use markdown for formatting
   - Add relevant examples when helpful

4. SOURCE HANDLING:
   - Cite sources using inline links: [Source Title](URL)
   - Prioritize high-scoring sources
   - Compare conflicting information
   - Indicate source relevance scores

5. LANGUAGE & STYLE:
   - ${languageStyle}
   - Maintain clear and engaging tone
   - Use active voice
   - Explain technical terms
   - Adapt complexity to query type

6. QUALITY CHECKS:
   - Verify factual accuracy
   - Ensure logical flow
   - Balance objectivity with insight
   - Provide context when needed

Consider Tavily's AI analysis for reference:
${tavilyAnswer || 'Not available'}

Available Sources:
${context}

Remember: Aim for the perfect balance between comprehensiveness and conciseness. Your goal is to provide maximum value while maintaining engagement.`;

    try {
      // Create stream with Groq
      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_completion_tokens: 1500,
        top_p: 0.9,
        stream: true,
      });

      // Convert stream to web-compatible format
      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        },
      });

      // Return the stream
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (streamError: any) {
      console.error("Groq streaming error:", streamError);
      
      // If we hit a token limit error, try with minimal context
      if (streamError.message?.includes('tokens')) {
        const minimalContext = truncatedResults[0]?.content || '';
        
        const fallbackStream = await groq.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: `You are an expert research assistant. Provide a balanced, ${language === 'indian' ? 'Indian English style' : 'standard English'} response using this context. Focus on key insights and maintain clarity.` 
            },
            { role: "user", content: `Based on this context: "${minimalContext}", ${query}` }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_completion_tokens: 800,
          stream: true,
        });

        // Convert fallback stream
        const fallbackReadable = new ReadableStream({
          async start(controller) {
            for await (const chunk of fallbackStream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            controller.close();
          },
        });

        return new Response(fallbackReadable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }

      throw streamError;
    }
  } catch (error) {
    console.error("Groq completion error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate completion",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 