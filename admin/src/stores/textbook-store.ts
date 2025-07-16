import { create } from 'zustand';

interface TextbookStore {
  subjects: Subject[];
  versions: TextbookVersion[];
  textbooks: Textbook[];
  courseUnits: CourseUnit[];
  stages: string[];
  grades: number[];

  setSubjects: (subjects: Subject[]) => void;
  setVersions: (versions: TextbookVersion[]) => void;
  setTextbooks: (textbooks: Textbook[]) => void;
  setCourseUnits: (courseUnits: CourseUnit[]) => void;

  loadSubjects: () => Promise<void>;
  loadVersions: () => Promise<void>;
  loadTextbooks: () => Promise<void>;
  loadCourseUnits: () => Promise<void>;
}

export const useTextbookStore = create<TextbookStore>((set) => ({
  subjects: [],
  versions: [],
  textbooks: [],
  stages: ['小学', '初中', '高中'],
  grades: Array.from({ length: 12 }, (_, i) => i + 1),

  setSubjects: (subjects) => set({ subjects }),
  setVersions: (versions) => set({ versions }),
  setTextbooks: (textbooks) => set({ textbooks }),

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

  loadTextbooks: async () => {
    try {
      const { CourseUnitApi } = await import('@/services/course-unit');
      const textbooks = await CourseUnitApi.getTextbooks();
      set({ textbooks });
    } catch (error) {
      console.error('Failed to load textbooks:', error);
    }
  },

  setCourseUnits: (courseUnits) => set({ courseUnits }),

  loadCourseUnits: async () => {
    try {
      const { KnowledgeApi } = await import('@/services/knowledge');
      const courseUnits = await KnowledgeApi.getCourseUnits();
      set({ courseUnits });
    } catch (error) {
      console.error('Failed to load course units:', error);
    }
  },
}));
