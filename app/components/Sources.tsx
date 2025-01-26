import React from 'react';

interface Source {
  title: string;
  url: string;
  score: number;
}

interface SourcesProps {
  sources: Source[];
}

export default function Sources({ sources }: SourcesProps) {
  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-sm font-medium text-gray-500">Sources:</h3>
      <div className="space-y-1">
        {sources.map((source, index) => (
          <div key={index} className="flex items-center text-sm">
            <div className="w-4 h-4 flex items-center justify-center mr-2 text-xs text-gray-500">
              {index + 1}.
            </div>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline truncate"
              title={source.title}
            >
              {source.title}
              <span className="ml-2 text-gray-400 text-xs">
                (relevance: {Math.round(source.score * 100)}%)
              </span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
} 