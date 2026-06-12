declare global {
  /**
   * 搜索教材请求
   */
  interface SearchTextbookRequest {
    teacher_id?: string;
    version?: string;
    grade?: number;
    subject?: string;
    semester?: string;
    page?: number;
    size?: number;
    page_size?: number;
  }

  /**
   * 保存教材请求
   */
  interface SaveTextbookRequest {
    teacher_id?: string;
    subject: string;
    version: string;
    grade: number;
    semester: string;
  }

  /**
   * 创建单元请求
   */
  interface CreateUnitRequest {
    name: string;
    content: string;
    textbook_id: number;
  }

  /**
   * 更新单元请求
   */
  interface UpdateUnitRequest {
    name?: string;
    content?: string;
  }
}
export {};
