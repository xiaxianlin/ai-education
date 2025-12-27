declare global {
  /**
   * 搜索学生请求
   */
  interface SearchStudentRequest extends SearchRequest {
    phone?: string;
    status?: number;
    keywords?: string;
    name?: string;
  }

  /**
   * 保存学生请求（创建/更新）
   */
  interface SaveStudentRequest {
    name: string;
    phone: string;
    grade: number;
    status?: number;
  }
}

export {};
