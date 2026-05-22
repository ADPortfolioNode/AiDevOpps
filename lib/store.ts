import { create } from 'zustand';

interface AppState {
  isDocumentUploadModalOpen: boolean;
  openDocumentUploadModal: () => void;
  closeDocumentUploadModal: () => void;
}

export const useStore = create<AppState>((set) => ({
  isDocumentUploadModalOpen: false,
  openDocumentUploadModal: () => set({ isDocumentUploadModalOpen: true }),
  closeDocumentUploadModal: () => set({ isDocumentUploadModalOpen: false }),
}));