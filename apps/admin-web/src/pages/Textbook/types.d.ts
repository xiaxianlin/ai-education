declare global {
  /**
   * 搜索教材请求
   */
  interface SearchTextbookRequest {
    version?: string;
    grade?: number;
    subject?: string;
  }

  /**
   * 保存教材请求
   */
  interface SaveTextbookRequest {
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

  /**
   * 创建知识点请求
   */
  interface CreateKnowledgeRequest {
    name: string;
    content: string;
    textbook_id: number;
    unit_id: number;
  }

  /**
   * 更新知识点请求
   */
  interface UpdateKnowledgeRequest {
    name?: string;
    content?: string;
  }
}
export {};
