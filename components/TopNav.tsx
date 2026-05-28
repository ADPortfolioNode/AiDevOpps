'use client';

import React from 'react';
import { useModalStore } from '@/lib/store';

export function TopNav() {
  const { openModal } = useModalStore();

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 shadow-md">
      <div className="text-xl font-bold text-white">AiDevOps</div>
      <div className="flex items-center space-x-4">
        {/* Existing navigation items can go here */}
        <button
          onClick={openModal}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Upload Document
        </button>
        {/* Example of another quick action card/button */}
        <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
          New Chat
        </button>
      </div>
    </nav>
  );
}