import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/core/api/endpoints/practice_endpoints.dart';
import 'package:student_app/core/models/practice.dart';

/// 练习列表 Provider
final practiceListProvider = FutureProvider<List<Practice>>((ref) async {
  return await PracticeEndpoints.listPractices();
});

