declare global {
  /**
   * 搜索教材版本请求
   */
  interface SearchTextbookVersionRequest {
    subject?: string;
  }

  /**
   * 保存教材版本请求
   */
  interface SaveTextbookVersionRequest {
    subject: string;
    name: string;
    revision_year: number;
  }
}
export {};
