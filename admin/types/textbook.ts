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

  interface TextbookSearchParams extends SearchParams {
    keyword?: string;
    subject?: string;
    grade?: number;
  }

  interface TextbookForm {
    subject: string;
    version: string;
    grade: number;
    semester: string;
  }

  interface Unit {
    id: number;
    textbook_id: number;
    name: string;
    content: string;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface UnitSearchParams extends SearchParams {
    keyword?: string;
  }

  interface UnitForm {
    textbook_id: number;
    name: string;
    content: string;
  }

  interface UnitUpdateForm {
    name?: string;
    content?: string;
    status?: number;
  }

  interface Knowledge {
    id: number;
    textbook_id: number;
    unit_id: number;
    name: string;
    content: string;
    difficulty?: string;
    importance?: number;
    order?: number;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface KnowledgeSearchParams extends SearchParams {
    keyword?: string;
  }

  interface KnowledgeForm {
    textbook_id: number;
    unit_id: number;
    name: string;
    content: string;
    difficulty?: string;
    importance?: number;
    order?: number;
  }

  interface KnowledgeUpdateForm {
    name?: string;
    content?: string;
    difficulty?: string;
    importance?: number;
    order?: number;
    status?: number;
  }

  interface TextbookContentForm {
    name: string;
    content: string;
    unit_id?: number;
    textbook_id?: number;
  }
}

export {};
