import 'package:flutter/material.dart';

/// 应用颜色配置
class AppColors {
  AppColors._();

  // Primary - Sky/Blue 色系
  static const Color primary = Color(0xFF0EA5E9); // sky-500
  static const Color primaryLight = Color(0xFF38BDF8); // sky-400
  static const Color primaryDark = Color(0xFF0284C7); // sky-600
  static const Color primaryForeground = Colors.white;

  // Success - Emerald/Green 色系
  static const Color success = Color(0xFF10B981); // emerald-500
  static const Color successLight = Color(0xFF34D399); // emerald-400
  static const Color successDark = Color(0xFF059669); // emerald-600

  // Warning - Amber/Yellow 色系
  static const Color warning = Color(0xFFF59E0B); // amber-500
  static const Color warningLight = Color(0xFFFBBF24); // amber-400
  static const Color warningDark = Color(0xFFD97706); // amber-600

  // Error - Red 色系
  static const Color error = Color(0xFFEF4444); // red-500
  static const Color errorLight = Color(0xFFF87171); // red-400
  static const Color errorDark = Color(0xFFDC2626); // red-600

  // 背景和前景
  static const Color background = Color(0xFFFFFFFF);
  static const Color foreground = Color(0xFF0F172A); // slate-900

  // 卡片
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardForeground = Color(0xFF0F172A);

  // 边框和输入
  static const Color border = Color(0xFFE2E8F0); // slate-200
  static const Color input = Color(0xFFE2E8F0);

  // 文本颜色
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B); // slate-500
  static const Color textMuted = Color(0xFF94A3B8); // slate-400

  // 其他
  static const Color muted = Color(0xFFF1F5F9); // slate-100
  static const Color mutedForeground = Color(0xFF64748B);
}

