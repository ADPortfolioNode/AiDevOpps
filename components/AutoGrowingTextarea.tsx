'use client';
import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const AutoGrowingTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextareaAutosize className={cn("flex min-h-[80px] w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref as any} {...props as any} />
    );
  }
);