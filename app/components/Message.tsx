import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageProps {
  content: string;
  type: 'user' | 'assistant';
  sources?: Array<{
    title: string;
    url: string;
    score: number;
  }>;
}

export default function Message({ content, type, sources }: MessageProps) {
  return (
    <div
      className={`flex ${
        type === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] p-4 rounded-lg ${
          type === 'user'
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-white shadow-sm rounded-bl-none'
        }`}
      >
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              // Style links differently for user/assistant messages
              a({ node, className, children, ...props }) {
                return (
                  <a
                    className={`${
                      type === 'user' ? 'text-white' : 'text-blue-600'
                    } hover:underline`}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
              // Add custom paragraph styling
              p({ node, className, children, ...props }) {
                return (
                  <p
                    className={`mb-2 last:mb-0 ${
                      type === 'user' ? 'text-white' : 'text-gray-800'
                    }`}
                    {...props}
                  >
                    {children}
                  </p>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        {type === 'assistant' && sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">Sources:</div>
            <div className="mt-1 space-y-1">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 hover:underline truncate"
                  title={source.title}
                >
                  {index + 1}. {source.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 