"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold mb-1.5 mt-2.5 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed [&>p]:inline">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent-orange/50 pl-3 my-2 text-white/70 italic">
            {children}
          </blockquote>
        ),
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="block bg-black/30 rounded-lg p-3 my-2 text-xs font-mono overflow-x-auto whitespace-pre">
                {children}
              </code>
            );
          }
          return (
            <code className="bg-white/10 rounded px-1.5 py-0.5 text-xs font-mono">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="my-2">{children}</pre>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-orange underline underline-offset-2 hover:text-accent-orange-hover"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-white/10 my-3" />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-white/20">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="text-left px-2 py-1 font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-2 py-1 border-t border-white/5">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
