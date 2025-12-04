/// 个人中心相关常量
class ProfileConstants {
  ProfileConstants._();

  /// 年级映射
  /// 1-12 对应 一年级-十二年级
  static const Map<int, String> grades = {
    1: '一年级',
    2: '二年级',
    3: '三年级',
    4: '四年级',
    5: '五年级',
    6: '六年级',
    7: '七年级',
    8: '八年级',
    9: '九年级',
    10: '高一',
    11: '高二',
    12: '高三',
  };

  /// 获取年级名称
  static String getGradeName(int grade) {
    return grades[grade] ?? '未知年级';
  }
}

