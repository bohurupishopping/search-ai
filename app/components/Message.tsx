import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { HTMLAttributes, AnchorHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Sources from './Sources';
import ImageGallery from './ImageGallery';

interface MessageProps {
  content: string;
  type: 'user' | 'assistant';
  sources?: Array<{
    title: string;
    url: string;
    score: number;
  }>;
  images?: Array<{
    url: string;
    description?: string;
  }>;
}

type CodeProps = HTMLAttributes<HTMLElement> & {
  inline?: boolean;
  className?: string;
};

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

type ParagraphProps = HTMLAttributes<HTMLParagraphElement>;

const CodeBlock = memo(({ language, children }: { language?: string; children: string }) => {
  const [copied, setCopied] = React.useState(false);
  const { theme } = useTheme();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <SyntaxHighlighter
        style={theme === 'dark' ? oneDark : oneLight}
        language={language || 'text'}
        PreTag="div"
        className={cn(
          "!my-4 !rounded-xl",
          "!border !border-neutral-200/30 dark:!border-neutral-700/30",
          "!bg-neutral-100/30 dark:!bg-neutral-800/20",
          "backdrop-blur-sm transition-all duration-200",
          "group-hover:!border-neutral-300/40 dark:group-hover:!border-neutral-600/40",
          "group-hover:shadow-lg"
        )}
        customStyle={{
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        showLineNumbers
      >
        {children}
      </SyntaxHighlighter>
      <button
        onClick={handleCopy}
        className={cn(
          "absolute top-3 right-3 p-2 rounded-lg",
          "opacity-0 group-hover:opacity-100 transition-all duration-200",
          "bg-neutral-200/40 dark:bg-neutral-700/40 backdrop-blur-sm",
          "hover:bg-neutral-300/50 dark:hover:bg-neutral-600/50",
          "transform hover:scale-105 active:scale-95"
        )}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-neutral-500" />
        )}
      </button>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

const Message = memo(({ content, type, sources, images }: MessageProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={content}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 sm:space-y-6"
      >
        {/* Message Content */}
        <motion.div 
          className={cn(
            "prose prose-neutral dark:prose-invert max-w-none",
            "prose-headings:mb-3 prose-headings:bg-gradient-to-br prose-headings:from-neutral-800 prose-headings:to-neutral-600 dark:prose-headings:from-neutral-200 dark:prose-headings:to-neutral-400 prose-headings:bg-clip-text prose-headings:text-transparent",
            "prose-pre:backdrop-blur-sm prose-pre:bg-neutral-100/30 dark:prose-pre:bg-neutral-800/20",
            "prose-blockquote:border-l-neutral-300/30 dark:prose-blockquote:border-l-neutral-700/30",
            "prose-strong:text-neutral-800 dark:prose-strong:text-neutral-200",
            "prose-code:bg-neutral-100/30 dark:prose-code:bg-neutral-800/20 prose-code:backdrop-blur-sm"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code(props: CodeProps) {
                const { inline, className, children, ...rest } = props;
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <CodeBlock language={match[1]} {...rest}>
                    {String(children).replace(/\n$/, '')}
                  </CodeBlock>
                ) : (
                  <code className={cn(
                    "px-1.5 py-0.5 rounded-md text-sm",
                    "bg-neutral-100/30 dark:bg-neutral-800/20 backdrop-blur-sm",
                    "border border-neutral-200/30 dark:border-neutral-700/30",
                    "transition-colors duration-200"
                  )} {...rest}>
                    {children}
                  </code>
                );
              },
              a(props: LinkProps) {
                const { href, children, ...rest } = props;
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1",
                      "text-blue-600/90 dark:text-blue-400/90",
                      "hover:text-blue-700 dark:hover:text-blue-300",
                      "no-underline hover:underline transition-colors duration-200",
                      "rounded px-1 py-0.5",
                      "hover:bg-blue-50/30 dark:hover:bg-blue-900/20",
                      "backdrop-blur-sm"
                    )}
                    {...rest}
                  >
                    {children}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                );
              },
              p(props: ParagraphProps) {
                const { children, ...rest } = props;
                return (
                  <p
                    className={cn(
                      "leading-7",
                      "transition-colors duration-200",
                      type === 'user' 
                        ? "text-neutral-800 dark:text-neutral-200" 
                        : "text-neutral-700 dark:text-neutral-300"
                    )}
                    {...rest}
                  >
                    {children}
                  </p>
                );
              },
              ul({ children }) {
                return (
                  <ul className="my-3 sm:my-4 ml-6 list-disc marker:text-neutral-500/60">
                    {children}
                  </ul>
                );
              },
              ol({ children }) {
                return (
                  <ol className="my-3 sm:my-4 ml-6 list-decimal marker:text-neutral-500/60">
                    {children}
                  </ol>
                );
              },
              li({ children }) {
                return (
                  <li className="mt-1.5 sm:mt-2 text-neutral-700 dark:text-neutral-300">
                    {children}
                  </li>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote className={cn(
                    "mt-3 sm:mt-4 border-l-4 pl-4 italic",
                    "border-neutral-300/30 dark:border-neutral-700/30",
                    "bg-neutral-50/30 dark:bg-neutral-800/20",
                    "backdrop-blur-sm rounded-r-lg py-2",
                    "text-neutral-700 dark:text-neutral-300"
                  )}>
                    {children}
                  </blockquote>
                );
              },
              h1({ children }) {
                return <h1 className="mt-6 sm:mt-8 mb-3 sm:mb-4 text-2xl font-bold bg-gradient-to-br from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="mt-5 sm:mt-6 mb-3 sm:mb-4 text-xl font-bold bg-gradient-to-br from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="mt-4 mb-2 text-lg font-bold bg-gradient-to-br from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">{children}</h3>;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </motion.div>

        {/* Image Gallery Section - Shown before sources */}
        {type === 'assistant' && images && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="mt-4 sm:mt-6"
          >
            <ImageGallery images={images} />
          </motion.div>
        )}

        {/* Sources Section */}
        {type === 'assistant' && sources && sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="mt-4 sm:mt-6"
          >
            <Sources sources={sources} />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

Message.displayName = 'Message';

export default Message;
