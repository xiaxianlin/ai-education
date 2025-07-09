declare global {
  interface ProfileFormModel {
    province?: string;
    stage?: string;
    grade?: string;
  }

  interface Profile {
    id: number;
    uid: string;
    province?: string;
    stage?: string;
    grade?: string;
    create_time: number;
    update_time?: number;
  }
  interface Question {
    id: string;
    key: string;
    question: string;
    subject: string;
    ocr_usage: number;
    llm_usage: number;
    create_time: number;
    answer?: string;
    reasoning?: string;
    update_time?: number;
  }
}

export {};
