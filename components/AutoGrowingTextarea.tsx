'use client';

import React, { forwardRef, useEffect, useRef, TextareaHTMLAttributes } from 'react';

interface AutoGrowingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
}

export const AutoGrowingTextarea = forwardRef<HTMLTextAreaElement, AutoGrowingTextareaProps>(
  ({ maxHeight = 220, className = '', ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
      const ta = textareaRef.current;
      if (!ta) return;

      ta.style.height = 'auto';
      const newHeight = Math.min(ta.scrollHeight, maxHeight);
      ta.style.height = `${newHeight}px`;
    };

    useEffect(() => {
      adjustHeight();
    }, [props.value]);

    return (
      <textarea
        ref={(el) => {
          textareaRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        className={`w-full resize-none overflow-y-auto bg-transparent focus:outline-none ${className}`}
        style={{ maxHeight: `${maxHeight}px` }}
        onInput={adjustHeight}
        {...props}
      />
    );
  }
);

AutoGrowingTextarea.displayName = 'AutoGrowingTextarea';