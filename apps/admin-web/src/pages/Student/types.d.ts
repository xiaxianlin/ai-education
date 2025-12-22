declare global {
  /**
   * 搜索学生请求
   */
  interface SearchStudentRequest extends SearchRequest {
    phone?: string;
    status?: number;
  }

  /**
   * 更新学生请求
   */
  interface SaveStudentRequest {
    name?: string;
    phone?: string;
    grade?: number;
    status?: number;
  }
}

export {};
