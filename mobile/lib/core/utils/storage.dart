import 'dart:async';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../models/student.dart';

/// 本地存储工具类
class Storage {
  Storage._();

  static SharedPreferences? _prefs;
  static Future<void>? _initFuture;
  static final Completer<void> _initCompleter = Completer<void>();

  /// 初始化存储（确保只初始化一次）
  static Future<void> init() async {
    // 如果已经初始化，直接返回
    if (_prefs != null) {
      return;
    }

    // 如果正在初始化，等待初始化完成
    if (_initFuture != null) {
      return _initFuture;
    }

    // 开始初始化
    _initFuture = _doInit();
    return _initFuture;
  }

  /// 执行初始化
  static Future<void> _doInit() async {
    try {
      _prefs = await SharedPreferences.getInstance();
      if (!_initCompleter.isCompleted) {
        _initCompleter.complete();
      }
    } catch (e) {
      if (!_initCompleter.isCompleted) {
        _initCompleter.completeError(e);
      }
      rethrow;
    }
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

