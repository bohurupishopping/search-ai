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

interface MessageProps {
  content: string;
  type: 'user' | 'assistant';
  sources?: Array<{
    title: string;
    url: string;
    score: number;
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
        className="!my-4 !bg-neutral-100 dark:!bg-neutral-800/50 !rounded-xl !border !border-neutral-200 dark:!border-neutral-700"
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
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "bg-neutral-200 dark:bg-neutral-700",
          "hover:bg-neutral-300 dark:hover:bg-neutral-600"
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

const Message = memo(({ content, type, sources }: MessageProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={content}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Message Content */}
        <motion.div 
          className="prose prose-neutral dark:prose-invert max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
                  <code className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm" {...rest}>
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
                      "text-blue-600 dark:text-blue-400",
                      "hover:text-blue-700 dark:hover:text-blue-300",
                      "no-underline hover:underline"
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
                  <ul className="my-4 ml-6 list-disc marker:text-neutral-500">
                    {children}
                  </ul>
                );
              },
              ol({ children }) {
                return (
                  <ol className="my-4 ml-6 list-decimal marker:text-neutral-500">
                    {children}
                  </ol>
                );
              },
              li({ children }) {
                return (
                  <li className="mt-2">
                    {children}
                  </li>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote className="mt-4 border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 italic">
                    {children}
                  </blockquote>
                );
              },
              h1({ children }) {
                return <h1 className="mt-8 mb-4 text-2xl font-bold">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="mt-6 mb-4 text-xl font-bold">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="mt-4 mb-2 text-lg font-bold">{children}</h3>;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </motion.div>

        {/* Sources Section - Shown below content */}
        {type === 'assistant' && sources && sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
