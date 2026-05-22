import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '@/lib/store'; // Assuming a Zustand or similar store for global state

export function DocumentUploadModal() {
  const { isDocumentUploadModalOpen, closeDocumentUploadModal } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setUrl(''); // Clear URL if file is selected
      setMessage('');
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setFile(null); // Clear file if URL is entered
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!file && !url) {
      setMessage('Please select a file or enter a URL.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    if (file) {
      formData.append('document', file);
    } else if (url) {
      formData.append('url', url);
    }

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('Document uploaded and processed successfully!');
        setFile(null);
        setUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || 'Failed to process document.'}`);
      }
    } catch (error) {
      setMessage(`Network error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDocumentUploadModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-surface p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-white">Upload Document to Knowledge Base</h2>
        <button
          onClick={closeDocumentUploadModal}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          &times;
        </button>

        <div className="mb-4">
          <label htmlFor="file-upload" className="mb-2 block text-sm font-medium text-gray-300">
            Upload File (PDF, TXT)
          </label>
          <input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            accept=".pdf,.txt"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent-dark"
          />
        </div>

        <div className="mb-4 text-center text-gray-400">OR</div>

        <div className="mb-4">
          <label htmlFor="url-input" className="mb-2 block text-sm font-medium text-gray-300">
            Enter URL
          </label>
          <input
            id="url-input"
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com/document.pdf"
            className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-accent focus:ring-accent"
          />
        </div>

        {message && (
          <p className={`mb-4 text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading || (!file && !url)}
          className="w-full rounded-md bg-accent px-4 py-2 font-bold text-white hover:bg-accent-dark disabled:opacity-50"
        >
          {isLoading 
            ? <span className="flex items-center justify-center"><span className="h-5 w-5 animate-spin rounded-full border-2 border-t-2 border-white border-t-transparent mr-2"></span>Processing...</span>
            : 'Upload and Process'}
        </button>
      </div>
    </div>,
    document.body
  );
}