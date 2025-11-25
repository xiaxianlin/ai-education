declare global {
  interface TeacherBook {
    id: number;
    subject: string;
    version: string;
    grade: number;
    semester: string;
    file?: string;
    index_file_id?: string;
  }

  interface TeacherBookSearchParams extends SearchParams {
    keyword?: string;
    subject?: string;
    grade?: number;
  }

  interface TeacherBookForm {
    subject: string;
    version: string;
    grade: number;
    semester: string;
  }
}

export {};
