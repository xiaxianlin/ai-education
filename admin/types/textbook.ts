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

  interface TextbookSearch {
    page: number;
    size: number;
    subject?: string;
    version?: string;
    grade?: number;
  }

  interface TextbookForm {
    subject: string;
    version: string;
    stage: string;
    grade: string;
    semester: string;
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
    status: number;
    create_time: number;
    update_time?: number;
    unit_id?: number;
    textbook_id?: number;
  }

  interface TextbookContentForm {
    name: string;
    content: string;
    unit_id?: number;
    textbook_id?: number;
  }
}

export {};
