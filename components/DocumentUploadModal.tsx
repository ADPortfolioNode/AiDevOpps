'use client';

import { useState, useCallback } from 'react';
import { useModalStore } from '@/lib/store';

// A simple X icon component
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export function DocumentUploadModal() {
  const { isModalOpen, closeModal } = useModalStore();
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setFeedback(null);
    }
  };

  const resetState = useCallback(() => {
    setFile(null);
    setUrl('');
    setIsLoading(false);
    setFeedback(null);
  }, []);

  const handleClose = () => {
    resetState();
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((uploadType === 'file' && !file) || (uploadType === 'url' && !url)) {
      setFeedback({ message: 'Please select a file or enter a URL.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    const formData = new FormData();
    if (uploadType === 'file' && file) {
      formData.append('document', file);
    } else if (uploadType === 'url' && url) {
      formData.append('url', url);
    }

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }

      setFeedback({ message: result.message || 'Processing complete!', type: 'success' });
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload.';
      setFeedback({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg border border-zinc-700 bg-zinc-900 p-6 text-white shadow-xl">
        <button onClick={handleClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white" aria-label="Close modal">
          <XIcon />
        </button>

        <h2 className="text-xl font-semibold">Upload to Knowledge Base</h2>
        <p className="mt-1 text-sm text-zinc-400">Upload files or scrape websites to add them to the agent's knowledge.</p>

        <div className="mt-4 flex border-b border-zinc-700">
          <button onClick={() => setUploadType('file')} className={`px-4 py-2 text-sm font-medium ${uploadType === 'file' ? 'border-b-2 border-blue-500 text-white' : 'text-zinc-400 hover:text-white'}`}>
            Upload File
          </button>
          <button onClick={() => setUploadType('url')} className={`px-4 py-2 text-sm font-medium ${uploadType === 'url' ? 'border-b-2 border-blue-500 text-white' : 'text-zinc-400 hover:text-white'}`}>
            From URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          {uploadType === 'file' ? (
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-zinc-300">PDF or TXT file</label>
              <input id="file-upload" name="file-upload" type="file" accept=".pdf,.txt" onChange={handleFileChange} className="mt-2 block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700" />
              {file && <p className="mt-2 text-xs text-zinc-400">Selected: {file.name}</p>}
            </div>
          ) : (
            <div>
              <label htmlFor="url-input" className="block text-sm font-medium text-zinc-300">Website URL</label>
              <input type="url" id="url-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="mt-2 block w-full rounded-md border-zinc-600 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            {feedback && <p className={`text-sm ${feedback.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{feedback.message}</p>}
            <button type="submit" disabled={isLoading} className="ml-auto inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Processing...' : 'Ingest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}