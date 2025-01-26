import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Image as ImageIcon, Loader2, Trash2, Check } from 'lucide-react';
import { FileUpload } from '@/types/conversation';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface AttachmentPreviewProps {
  attachments: FileUpload[];
  onRemove: (id: string) => void;
  className?: string;
}

export const AttachmentPreview = ({ 
  attachments, 
  onRemove, 
  className
}: AttachmentPreviewProps) => {
  if (attachments.length === 0) return null;

  return (
    <div className={cn(
      "flex flex-nowrap gap-2 overflow-x-auto py-2 px-1",
      "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
      className
    )}>
      <AnimatePresence mode="popLayout">
        {attachments.map((attachment) => (
          <motion.div 
            key={attachment.id}
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="group relative flex-shrink-0"
          >
            {/* Preview Container */}
            <div className={cn(
              "relative w-14 h-14 rounded-lg overflow-hidden",
              "border border-gray-200 dark:border-gray-700",
              "bg-gray-50 dark:bg-gray-800",
              "transition-all duration-200",
              "group-hover:border-gray-300 dark:group-hover:border-gray-600"
            )}>
              {/* Image Preview */}
              {attachment.type === 'image' && attachment.preview && (
                <img 
                  src={attachment.preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              )}

              {/* Document Preview */}
              {attachment.type === 'document' && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
                  <FileText className="w-6 h-6 text-gray-400" />
                  <span className="text-[8px] text-center text-gray-500 dark:text-gray-400 max-w-full px-0.5 truncate">
                    {attachment.file.name}
                  </span>
                </div>
              )}

              {/* Loading Overlay */}
              {attachment.uploading && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}

              {/* Hover Actions */}
              <div className={cn(
                "absolute inset-0 bg-black/40 backdrop-blur-[1px]",
                "opacity-0 group-hover:opacity-100",
                "transition-opacity duration-200",
                "flex items-center justify-center"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => onRemove(attachment.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* File Type Badge */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 
              bg-white dark:bg-gray-800 px-1.5 py-px rounded-full
              border border-gray-200 dark:border-gray-700
              text-[8px] font-medium text-gray-600 dark:text-gray-300
              shadow-sm">
              {attachment.type === 'image' ? 'IMG' : 'DOC'}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}; 