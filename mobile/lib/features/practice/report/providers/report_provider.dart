import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/endpoints/practice_endpoints.dart';
import '../../../../core/models/practice_report.dart';

/// 报告数据解析结果
class ReportData {
  final PracticeReport report;
  final Map<String, double>? knowledgeScores;
  final Map<String, dynamic>? questionDistribution;
  final Map<String, dynamic>? abilityBreakdown;
  final List<String>? strengths;
  final List<String>? weaknesses;
  final List<String>? recommendations;

  ReportData({
    required this.report,
    this.knowledgeScores,
    this.questionDistribution,
    this.abilityBreakdown,
    this.strengths,
    this.weaknesses,
    this.recommendations,
  });
}

/// 练习报告 Provider
/// 从详情页面获取报告数据并解析 JSON 字段
final practiceReportProvider = FutureProvider.family<ReportData, int>((ref, sessionId) async {
  // 从详情接口获取数据（详情接口包含 report）
  final detail = await PracticeEndpoints.getSessionDetail(sessionId);
  final report = detail.report;

  if (report == null) {
    throw Exception('报告不存在');
  }

  // 解析 JSON 字符串字段
  Map<String, double>? knowledgeScores;
  if (report.knowledgeScores != null && report.knowledgeScores!.isNotEmpty) {
    try {
      final decoded = jsonDecode(report.knowledgeScores!) as Map<String, dynamic>;
      knowledgeScores = decoded.map((key, value) => MapEntry(key, (value as num).toDouble()));
    } catch (e) {
      // 解析失败，忽略
    }
  }

  Map<String, dynamic>? questionDistribution;
  if (report.questionDistribution != null && report.questionDistribution!.isNotEmpty) {
    try {
      questionDistribution = jsonDecode(report.questionDistribution!) as Map<String, dynamic>;
    } catch (e) {
      // 解析失败，忽略
    }
  }

  Map<String, dynamic>? abilityBreakdown;
  if (report.abilityBreakdown != null && report.abilityBreakdown!.isNotEmpty) {
    try {
      abilityBreakdown = jsonDecode(report.abilityBreakdown!) as Map<String, dynamic>;
    } catch (e) {
      // 解析失败，忽略
    }
  }

  List<String>? strengths;
  if (report.strengths != null && report.strengths!.isNotEmpty) {
    try {
      strengths = List<String>.from(jsonDecode(report.strengths!));
    } catch (e) {
      // 解析失败，忽略
    }
  }

  List<String>? weaknesses;
  if (report.weaknesses != null && report.weaknesses!.isNotEmpty) {
    try {
      weaknesses = List<String>.from(jsonDecode(report.weaknesses!));
    } catch (e) {
      // 解析失败，忽略
    }
  }

  List<String>? recommendations;
  if (report.recommendations != null && report.recommendations!.isNotEmpty) {
    try {
      recommendations = List<String>.from(jsonDecode(report.recommendations!));
    } catch (e) {
      // 解析失败，忽略
    }
  }

  return ReportData(
    report: report,
    knowledgeScores: knowledgeScores,
    questionDistribution: questionDistribution,
    abilityBreakdown: abilityBreakdown,
    strengths: strengths,
    weaknesses: weaknesses,
    recommendations: recommendations,
  );
});

