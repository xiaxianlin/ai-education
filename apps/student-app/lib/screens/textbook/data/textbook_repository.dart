import 'package:student_app/core/api/endpoints/textbook_endpoints.dart';
import 'package:student_app/core/models/textbook.dart';
import 'package:student_app/core/models/unit.dart';
import 'package:student_app/core/models/knowledge.dart';

/// 教材数据仓库
/// 封装教材、单元、知识点相关的数据获取逻辑
class TextbookRepository {
  TextbookRepository._();

  static final TextbookRepository instance = TextbookRepository._();

  /// 获取单元列表
  /// [textbookId] 教材ID
  Future<List<Unit>> getUnits(int textbookId) async {
    return await TextbookEndpoints.getUnits(textbookId);
  }

  /// 获取知识点列表
  /// [unitId] 单元ID
  Future<List<Knowledge>> getKnowledges(int unitId) async {
    return await TextbookEndpoints.getKnowledges(unitId);
  }

  /// 筛选教材列表
  /// [textbooks] 教材列表
  /// [subject] 科目筛选（可选）
  /// [grade] 年级筛选（可选）
  List<Textbook> filterTextbooks({
    required List<Textbook> textbooks,
    String? subject,
    int? grade,
  }) {
    var filtered = textbooks;

    if (subject != null && subject.isNotEmpty) {
      filtered = filtered.where((book) => book.subject == subject).toList();
    }

    if (grade != null) {
      filtered = filtered.where((book) => book.grade == grade).toList();
    }

    return filtered;
  }

  /// 排序教材列表
  /// [textbooks] 教材列表
  /// 按科目、年级、学期排序
  List<Textbook> sortTextbooks(List<Textbook> textbooks) {
    final sorted = List<Textbook>.from(textbooks);
    sorted.sort((a, b) {
      // 先按科目排序
      if (a.subject != b.subject) {
        return a.subject.compareTo(b.subject);
      }
      // 科目相同按年级排序
      if (a.grade != b.grade) {
        return a.grade.compareTo(b.grade);
      }
      // 年级相同按学期排序
      const semesterOrder = {'上学期': 0, '下学期': 1, '整学期': 2};
      final orderA = semesterOrder[a.semester] ?? 3;
      final orderB = semesterOrder[b.semester] ?? 3;
      return orderA.compareTo(orderB);
    });
    return sorted;
  }
}

