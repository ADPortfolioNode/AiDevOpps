'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  language: string;
  value: string;
}

export const CodeBlock = ({ language, value, ...props }: CodeBlockProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative my-2 bg-slate-900 rounded-lg overflow-hidden border border-white/10" {...props}>
      <div className="flex items-center justify-between px-4 py-1 bg-slate-800/50 text-xs text-slate-400">
        <span>{language}</span>
        <button onClick={handleCopy} className="text-xs font-semibold hover:text-white transition-colors disabled:text-slate-500" disabled={isCopied}>
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', backgroundColor: 'transparent' }} codeTagProps={{ style: { fontFamily: 'inherit' } }}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
};