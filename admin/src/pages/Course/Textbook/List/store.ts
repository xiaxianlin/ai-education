import { TextbookApi } from '@/services/textbook';
import { create } from 'zustand';

interface TextbookStore {
  visible: boolean;
  subjects: Subject[];
  versions: TextbookVersion[];
  stages: string[];
  grades: string[][];
  semeters: string[];

  setVisbile: (visible: boolean) => void;
  loadSubjects: () => Promise<void>;
  loadVersions: () => Promise<void>;
}

export const useTextbookStore = create<TextbookStore>((set) => ({
  visible: false,
  isEdit: false,
  subjects: [],
  versions: [],
  stages: ['小学', '初中', '高中'],
  grades: [
    ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    ['一年级', '二年级', '三年级'],
    ['一年级', '二年级', '三年级'],
  ],
  semeters: ['上学期', '下学期', '整学期'],

  loadSubjects: async () => {
    const subjects = await TextbookApi.getSubjects();
    set({ subjects });
  },

  loadVersions: async () => {
    const versions = await TextbookApi.getVersions();
    set({ versions });
  },

  setVisbile: (visible) => set({ visible }),

  handleAdd: () => {
    set({ visible: true });
  },

  handleCancel: () => {
    set({ visible: false });
  },
}));
