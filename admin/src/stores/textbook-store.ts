import { create } from 'zustand';

interface TextbookStore {
  subjects: Subject[];
  versions: TextbookVersion[];
  stages: string[];
  grades: number[];
  
  setSubjects: (subjects: Subject[]) => void;
  setVersions: (versions: TextbookVersion[]) => void;
  
  loadSubjects: () => Promise<void>;
  loadVersions: () => Promise<void>;
}

export const useTextbookStore = create<TextbookStore>((set) => ({
  subjects: [],
  versions: [],
  stages: ['小学', '初中', '高中'],
  grades: Array.from({ length: 12 }, (_, i) => i + 1),
  
  setSubjects: (subjects) => set({ subjects }),
  setVersions: (versions) => set({ versions }),
  
  loadSubjects: async () => {
    try {
      const { TextbookApi } = await import('@/services/textbook');
      const subjects = await TextbookApi.getSubjects();
      set({ subjects });
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  },
  
  loadVersions: async () => {
    try {
      const { TextbookApi } = await import('@/services/textbook');
      const versions = await TextbookApi.getVersions();
      set({ versions });
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  },
}));