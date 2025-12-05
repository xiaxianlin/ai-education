import { ApiClient } from '../client';
import type {
  Student,
  PracticeSession,
  PracticeAnswer,
  PracticeDetail,
  PracticeWrongRecord,
  Textbook,
  Unit,
  Knowledge,
  ListResponse,
} from '../../types';

/**
 * 学生端 API 客户端类
 */
export class StudentApiClient extends ApiClient {
  constructor(baseURL: string = '/api/student') {
    super(baseURL, '_t'); // student 应用使用 '_t' 作为 token key
  }

  // ========== 认证相关 ==========

  /**
   * 用户登录
   * POST /login
   */
  async login(params: { phone: string; password: string }): Promise<string> {
    return this.post<string>('/login', params);
  }

  /**
   * 检查登录状态
   * GET /check
   */
  async check(): Promise<void> {
    return this.get<void>('/check');
  }

  // ========== 用户信息 ==========

  /**
   * 获取用户资料
   * GET /profile
   */
  async getProfile(): Promise<Student> {
    return this.get<Student>('/profile');
  }

  // ========== 练习相关 ==========

  /**
   * 获取每日练习
   * GET /practice/daily
   */
  async getDailyPractice(): Promise<PracticeSession[]> {
    return this.get<PracticeSession[]>('/practice/daily');
  }

  /**
   * 获取单元练习
   * GET /practice/unit
   */
  async getUnitPractice(): Promise<PracticeSession[]> {
    return this.get<PracticeSession[]>('/practice/unit');
  }

  /**
   * 获取能力评测
   * GET /practice/assessment
   */
  async getAssessment(): Promise<PracticeSession[]> {
    return this.get<PracticeSession[]>('/practice/assessment');
  }

  /**
   * 创建练习
   * POST /practice/create
   */
  async createPractice(params: {
    type: 'daily_practice' | 'unit_practice' | 'assessment';
    textbook_id: number;
    unit_id?: number;
  }): Promise<number> {
    return this.post<number>('/practice/create', params);
  }

  /**
   * 开始练习
   * POST /practice/{session_id}/begin
   */
  async beginPractice(sessionId: number): Promise<void> {
    return this.post<void>(`/practice/${sessionId}/begin`);
  }

  /**
   * 提交答案
   * POST /practice/answer
   */
  async submitAnswer(params: {
    session_id: number;
    question_id: number;
    answer: string;
    time_spent: number;
    is_audio_answer?: boolean;
    audio_data?: string;
    audio_match?: boolean;
    audio_analysis?: string;
  }): Promise<{
    is_correct: boolean;
    correct_answer: string;
    user_answer: string;
    analysis?: string;
  }> {
    return this.post<{
      is_correct: boolean;
      correct_answer: string;
      user_answer: string;
      analysis?: string;
    }>('/practice/answer', params);
  }

  /**
   * 上传口语题录音并进行语音识别
   * POST /practice/answer/{session_id}/{question_id}/upload
   */
  async uploadRecording(
    sessionId: number,
    questionId: number,
    audioBlob: Blob
  ): Promise<{
    oss_path: string;
    transcription: string;
    match: boolean;
    analysis: string;
  }> {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'audio.webm');
    return this.postForm<{
      oss_path: string;
      transcription: string;
      match: boolean;
      analysis: string;
    }>(`/practice/answer/${sessionId}/${questionId}/upload`, formData);
  }

  /**
   * 完成练习
   * POST /practice/{session_id}/complete
   */
  async completePractice(sessionId: number): Promise<PracticeDetail> {
    return this.post<PracticeDetail>(`/practice/${sessionId}/complete`);
  }

  /**
   * 获取练习会话详情
   * GET /practice/detail/{session_id}
   */
  async getSessionDetail(sessionId: number): Promise<PracticeDetail> {
    return this.get<PracticeDetail>(`/practice/detail/${sessionId}`);
  }

  /**
   * 获取练习历史记录
   * GET /practice/history/{type}
   */
  async getPracticeHistory(
    type: 'daily_practice' | 'unit_practice' | 'assessment',
    limit?: number
  ): Promise<PracticeSession[]> {
    const params = limit ? { limit } : undefined;
    return this.get<PracticeSession[]>(`/practice/history/${type}`, { params });
  }

  // ========== 教材相关 ==========

  /**
   * 获取教材的单元列表
   * GET /textbook/{textbook_id}/units
   */
  async getTextbookUnits(textbookId?: number): Promise<Unit[]> {
    return this.get<Unit[]>(`/textbook/${textbookId}/units`);
  }

  /**
   * 获取单元的知识点列表
   * GET /textbook/{unit_id}/knowledges
   */
  async getUnitKnowledge(unitId: number): Promise<Knowledge[]> {
    return this.get<Knowledge[]>(`/textbook/${unitId}/knowledges`);
  }

  // ========== 错题记录 ==========

  /**
   * 获取错题列表
   * GET /wrong-records
   */
  async getWrongRecords(params?: {
    textbook_id?: number;
    unit_id?: number;
    is_corrected?: number;
    limit?: number;
  }): Promise<PracticeWrongRecord[]> {
    return this.get<PracticeWrongRecord[]>('/wrong-records', { params });
  }

  /**
   * 标记错题为已订正
   * POST /wrong-records/{record_id}/correct
   */
  async markAsCorrected(recordId: number): Promise<void> {
    return this.post<void>(`/wrong-records/${recordId}/correct`);
  }

  /**
   * 获取错题统计
   * GET /wrong-records/stats
   */
  async getWrongRecordsStats(textbookId?: number): Promise<{
    total: number;
    corrected: number;
    uncorrected: number;
    by_unit: Record<string, number>;
    by_knowledge: Record<string, number>;
  }> {
    const params = textbookId ? { textbook_id: textbookId } : undefined;
    return this.get<{
      total: number;
      corrected: number;
      uncorrected: number;
      by_unit: Record<string, number>;
      by_knowledge: Record<string, number>;
    }>('/wrong-records/stats', { params });
  }
}

/**
 * 学生端 API 客户端实例
 * 直接使用此实例调用 API 方法
 */
export const studentApi = new StudentApiClient();

