declare global {
  interface CourseUnit {
    id: string;
    textbook: Textbook;
    name: string;
    content: string;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface CreateCourseUnit {
    textbook_id: number;
    name: string;
    content: string;
  }

  interface UpdateCourseUnit {
    name: string;
    content: string;
  }
}

export {};
