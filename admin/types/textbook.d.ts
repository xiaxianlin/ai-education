declare global {
  interface TextbookVersion {
    id: string;
    name: string;
    status: number;
    create_time: number;
  }

  interface CreateTextbookVersion {
    name: string;
  }

  interface Textbook {
    id: number;
    name?: string;
    /** 科目 */
    subject: string;
    /** 教材版本 */
    version: string;
    /** 学习阶段：小、初、高 */
    stage: string;
    /** 年级：1～12 */
    grade: string;
    semester: string;
    is_parsed?: number;
    index_file_id?: string;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface TextbookFormModel {
    subject: string;
    version: string;
    stage: string;
    grade: string;
    semester: string;
  }
}

export {};
