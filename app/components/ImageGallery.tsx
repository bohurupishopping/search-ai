import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TavilyImage {
  url: string;
  description?: string;
}

interface ImageGalleryProps {
  images: TavilyImage[];
}

const ImageCard = memo(({ image, idx }: { image: TavilyImage; idx: number }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: idx * 0.1 }}
      className={cn(
        "group relative overflow-hidden",
        "bg-white dark:bg-neutral-800",
        "border border-neutral-200 dark:border-neutral-700",
        "rounded-lg shadow-sm",
        "hover:shadow-md transition-shadow duration-200"
      )}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        {isLoading && !error && (
          <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
            <ImageIcon className="h-8 w-8 text-neutral-400" />
          </div>
        ) : (
          <img
            src={image.url}
            alt={image.description || 'Search result image'}
            className={cn(
              "w-full h-full object-cover",
              "transition-transform duration-300 group-hover:scale-105",
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError(true);
            }}
          />
        )}
        
        {/* Overlay with description */}
        {image.description && (
          <div className={cn(
            "absolute inset-x-0 bottom-0",
            "bg-gradient-to-t from-black/60 to-transparent",
            "p-3",
            "transform translate-y-full group-hover:translate-y-0",
            "transition-transform duration-300"
          )}>
            <p className="text-xs text-white line-clamp-2">
              {image.description}
            </p>
          </div>
        )}

        {/* External link button */}
        <a
          href={image.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "absolute top-2 right-2",
            "p-1.5 rounded-lg",
            "bg-black/20 backdrop-blur-sm",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-200",
            "hover:bg-black/30"
          )}
        >
          <ExternalLink className="h-4 w-4 text-white" />
        </a>
      </div>
    </motion.div>
  );
});

ImageCard.displayName = 'ImageCard';

const ImageGallery = memo(({ images }: ImageGalleryProps) => {
  if (!images?.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Related Images
      </h3>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      >
        {images.map((image, idx) => (
          <ImageCard key={`${image.url}-${idx}`} image={image} idx={idx} />
        ))}
      </motion.div>
    </div>
  );
});

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery; 