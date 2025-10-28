declare global {
  interface Textbook {
    id: number;
    subject: string;
    version: string;
    grade: number;
    semester: string;
    file?: string;
    index_file_id?: string;
    is_parsed?: number;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface Unit {
    id: number;
    name: string;
    content: string;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface Knowledge {
    id: number;
    name: string;
    content: string;
    analysis_text?: string;
    analysis_audio?: string;
    analysis_video?: string;
    status: number;
    create_time: number;
    update_time?: number;
    course_unit?: Unit;
  }

  interface TextbookForm {
    subject: string;
    version: string;
    stage: string;
    grade: string;
    semester: string;
  }

  interface CoureSimpleForm {
    name: string;
    content: string;
    textbook_id?: number;
    course_unit_id?: number;
  }

  interface TextbookSearch {
    page: number;
    size: number;
    subject?: string;
    version?: string;
    grade?: number;
  }
}

export {};
