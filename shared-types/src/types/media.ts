import { BaseEntity, ResourceType } from './common';

// ===== 媒体文件相关 =====

/**
 * 媒体文件信息
 */
export interface MediaFile extends BaseEntity {
  id: string;
  filename: string;
  original_name: string;
  file_type: ResourceType;
  mime_type: string;
  file_size: number; // 文件大小（字节）
  file_path: string; // 文件存储路径
  oss_path?: string; // OSS 存储路径
  url?: string; // 访问URL
  duration?: number; // 音频/视频时长（秒）
  width?: number; // 图片/视频宽度
  height?: number; // 图片/视频高度
  description?: string; // 文件描述
  tags?: string[]; // 标签
  uploaded_by: string; // 上传者ID
  is_public: boolean; // 是否公开
}

// ===== 音频处理相关 =====

/**
 * 音频转录结果
 */
export interface AudioTranscription {
  id: string;
  original_path: string; // 原始音频路径
  transcription: string; // 转录文本
  confidence: number; // 转录置信度 0-1
  language: string; // 语言代码
  duration: number; // 音频时长
  processed_at: number; // 处理时间
}

/**
 * 音频匹配分析
 */
export interface AudioMatchAnalysis {
  match: boolean; // 是否匹配题目要求
  score: number; // 匹配度分数 0-100
  reason: string; // 匹配/不匹配的原因
  suggestion?: string; // 改进建议
  keywords_matched: string[]; // 匹配的关键词
  keywords_missing: string[]; // 缺失的关键词
  fluency_score?: number; // 流利度分数
  pronunciation_score?: number; // 发音准确度分数
}

/**
 * 音频上传结果
 */
export interface AudioUploadResult {
  success: boolean;
  file_id?: string;
  oss_path?: string;
  url?: string;
  file_size?: number;
  duration?: number;
  error?: string;
}

// ===== 图片处理相关 =====

/**
 * 图片生成请求
 */
export interface ImageGenerationRequest {
  prompt: string; // 图片描述
  style?: string; // 图片风格
  width?: number; // 宽度
  height?: number; // 高度
  quality?: string; // 图片质量
  question_id?: number; // 关联的题目ID
  subject?: string; // 科目
  grade?: number; // 年级
}

/**
 * 图片生成结果
 */
export interface ImageGenerationResult {
  success: boolean;
  image_id?: string;
  image_url?: string;
  oss_path?: string;
  width?: number;
  height?: number;
  file_size?: number;
  generation_time?: number; // 生成耗时（秒）
  error?: string;
}