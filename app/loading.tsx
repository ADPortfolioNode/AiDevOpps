import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Synchronizing AiDevOps...</p>
      </div>
    </div>
  );
}