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
    id: string;
    /** 科目 */
    subject: string;
    /** 教材版本 */
    version: string;
    /** 学习阶段：小、初、高 */
    stage: string;
    /** 年级：1～12 */
    grade: number;
    /** 文档 */
    pdf?: string;
    status: number;
    create_time: number;
  }

  interface CreateTextbook {
    subject: string;
    version: string;
    stage: string;
    grade: number;
  }
}

export {};
