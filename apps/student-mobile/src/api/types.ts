export interface PracticeStatistics {
  total_practices: number; // 总练习数
  total_questions: number; // 总做题数
  completed_unit_practices: number; // 完成的单元练习数
  completed_ability_practices: number; // 完成的能力练习数
  total_accuracy: number; // 总正确率（百分比）
  average_accuracy: number; // 平均正确率（百分比）
}

export interface PracticeStatisticsResponse {
  all_time: PracticeStatistics; // 全部时间统计数据
  recent_30_days: PracticeStatistics; // 最近30天统计数据
}
