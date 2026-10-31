import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  if (!content) return null;

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="font-garamond text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mt-6 mb-3 border-b border-slate-200 dark:border-white/10 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-garamond text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mt-5 mb-2.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-garamond text-lg sm:text-xl font-medium text-slate-900 dark:text-white mt-4 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-sans text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-3 mb-1.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3.5 leading-relaxed text-slate-800 dark:text-slate-200 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-950 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-800 dark:text-slate-200">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="my-3 pl-5 list-disc space-y-1.5 text-slate-800 dark:text-slate-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 pl-5 list-decimal space-y-1.5 text-slate-800 dark:text-slate-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 marker:text-emerald-700 dark:marker:text-cyan-400">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-emerald-700/60 dark:border-cyan-400/60 pl-4 py-1 italic bg-slate-50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className || !className.includes("language-");
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-mono text-xs text-emerald-800 dark:text-cyan-300 font-semibold border border-slate-200/80 dark:border-white/10">
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                <code>{children}</code>
              </pre>
            );
          },
          hr: () => (
            <hr className="my-5 border-slate-200 dark:border-white/10" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;