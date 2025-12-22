declare global {
  /**
   * 保存教师用书请求
   */
  interface SaveTeacherBookRequest {
    subject: string;
    version: string;
    grade: number;
    semester: string;
  }
}

export {};
