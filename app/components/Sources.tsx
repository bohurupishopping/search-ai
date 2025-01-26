import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Source {
  title: string;
  url: string;
  score: number;
}

interface SourcesProps {
  sources: Source[];
}

const SourceCard = memo(({ source, idx }: { source: Source; idx: number }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const hostname = new URL(source.url).hostname;
  const isImage = source.url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i);

  return (
    <motion.a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-white dark:hover:bg-neutral-800 hover:shadow-sm transition-all overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: idx * 0.05 }}
    >
      {/* Image Preview for Image URLs */}
      {isImage && (
        <div className="aspect-[4/3] relative overflow-hidden">
          {isImageLoading && !imageError && (
            <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          )}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
              <ImageIcon className="h-8 w-8 text-neutral-400" />
            </div>
          ) : (
            <img
              src={source.url}
              alt={source.title}
              className={cn(
                "w-full h-full object-cover",
                "transition-transform duration-300 group-hover:scale-105",
                isImageLoading ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false);
                setImageError(true);
              }}
            />
          )}
        </div>
      )}

      {/* Source Info */}
      <div className={cn("flex items-center gap-2", "p-2")}>
        {!isImage && (
          <div className="flex-shrink-0 w-5 h-5 rounded bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
            <img
              src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
              alt=""
              className="w-3 h-3"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z'%3E%3C/path%3E%3Cpolyline points='10 2 10 22'%3E%3C/polyline%3E%3C/svg%3E";
              }}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {source.title}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className="truncate">{hostname}</span>
            <span className="text-neutral-300 dark:text-neutral-600">•</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {Math.round(source.score * 100)}%
            </span>
          </div>
        </div>
      </div>
      {/* Relevance indicator */}
      <div 
        className="absolute bottom-0 left-0 h-0.5 bg-blue-500/30"
        style={{ width: `${Math.round(source.score * 100)}%` }}
      />
    </motion.a>
  );
});

SourceCard.displayName = 'SourceCard';

const Sources = memo(({ sources }: SourcesProps) => {
  if (!sources.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
    >
      {sources.map((source, idx) => (
        <SourceCard key={`${source.url}-${idx}`} source={source} idx={idx} />
      ))}
    </motion.div>
  );
});

Sources.displayName = 'Sources';

export default Sources; 