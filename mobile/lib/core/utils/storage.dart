import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../models/student.dart';

/// 本地存储工具类
class Storage {
  Storage._();

  static SharedPreferences? _prefs;

  /// 初始化存储
  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  /// 保存 JWT Token
  static Future<bool> saveToken(String token) async {
    await init();
    return await _prefs!.setString(AppConstants.storageKeyToken, token);
  }

  /// 获取 JWT Token
  static String? getToken() {
    if (_prefs == null) return null;
    return _prefs!.getString(AppConstants.storageKeyToken);
  }

  /// 删除 JWT Token
  static Future<bool> removeToken() async {
    await init();
    return await _prefs!.remove(AppConstants.storageKeyToken);
  }

  /// 保存用户信息
  static Future<bool> saveUserInfo(Student student) async {
    await init();
    final json = jsonEncode(student.toJson());
    return await _prefs!.setString(AppConstants.storageKeyUserInfo, json);
  }

  /// 获取用户信息
  static Student? getUserInfo() {
    if (_prefs == null) return null;
    final json = _prefs!.getString(AppConstants.storageKeyUserInfo);
    if (json == null) return null;
    try {
      final map = jsonDecode(json) as Map<String, dynamic>;
      return Student.fromJson(map);
    } catch (e) {
      return null;
    }
  }

  /// 清除所有存储数据
  static Future<bool> clearAll() async {
    await init();
    return await _prefs!.clear();
  }
}

