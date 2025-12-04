import 'package:intl/intl.dart';

/// 格式化工具类
class Formatters {
  Formatters._();

  /// 格式化时间戳为日期时间字符串
  /// [timestamp] Unix 时间戳（秒）
  /// [format] 日期格式，默认: 'yyyy-MM-dd HH:mm:ss'
  static String formatDateTime(int timestamp, {String? format}) {
    final date = DateTime.fromMillisecondsSinceEpoch(timestamp * 1000);
    return DateFormat(format ?? 'yyyy-MM-dd HH:mm:ss').format(date);
  }

  /// 格式化时间戳为日期字符串
  /// [timestamp] Unix 时间戳（秒）
  static String formatDate(int timestamp) {
    return formatDateTime(timestamp, format: 'yyyy-MM-dd');
  }

  /// 格式化时间戳为时间字符串
  /// [timestamp] Unix 时间戳（秒）
  static String formatTime(int timestamp) {
    return formatDateTime(timestamp, format: 'HH:mm:ss');
  }

  /// 格式化秒数为时长字符串
  /// [seconds] 秒数
  /// 例如: 125 -> "2分5秒"
  static String formatDuration(int seconds) {
    if (seconds < 60) {
      return '$seconds秒';
    }
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    if (remainingSeconds == 0) {
      return '$minutes分钟';
    }
    return '$minutes分$remainingSeconds秒';
  }

  /// 格式化数字
  /// [number] 数字
  /// [decimals] 小数位数，默认 0
  static String formatNumber(num number, {int decimals = 0}) {
    return NumberFormat('#,##0.${'0' * decimals}').format(number);
  }

  /// 格式化百分比
  /// [value] 0-1 之间的值
  /// [decimals] 小数位数，默认 1
  static String formatPercent(double value, {int decimals = 1}) {
    return '${(value * 100).toStringAsFixed(decimals)}%';
  }
}

