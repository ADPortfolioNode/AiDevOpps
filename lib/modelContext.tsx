'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AIModel = 'gpt-4o-mini' | 'llama-local';

interface ModelContextType {
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o-mini');

  // Load initial value from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('aidevopps-model') as AIModel;
    if (saved && (saved === 'gpt-4o-mini' || saved === 'llama-local')) {
      setSelectedModel(saved);
    }
  }, []);

  const handleSetModel = (model: AIModel) => {
    setSelectedModel(model);
    localStorage.setItem('aidevopps-model', model);
  };

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel: handleSetModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModelContext() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModelContext must be used within a ModelProvider');
  }
  return context;
}