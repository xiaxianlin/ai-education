import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart' show StateNotifier;
import 'package:student_app/core/models/textbook.dart';
import 'package:student_app/core/models/unit.dart';
import 'package:student_app/core/models/knowledge.dart';
import 'package:student_app/core/utils/error_handler.dart';
import 'package:student_app/screens/textbook/data/textbook_repository.dart';
import 'package:student_app/screens/profile/providers/profile_provider.dart';

/// 教材筛选状态
class TextbookFilterState {
  final String? selectedSubject;
  final int? selectedGrade;

  const TextbookFilterState({
    this.selectedSubject,
    this.selectedGrade,
  });

  TextbookFilterState copyWith({
    String? selectedSubject,
    int? selectedGrade,
  }) {
    return TextbookFilterState(
      selectedSubject: selectedSubject ?? this.selectedSubject,
      selectedGrade: selectedGrade ?? this.selectedGrade,
    );
  }
}

/// 单元和知识点状态
class UnitState {
  final List<Unit> units;
  final Map<int, List<Knowledge>> knowledgesMap; // unitId -> knowledges
  final Map<int, bool> loadingKnowledges; // unitId -> loading
  final bool isLoading;
  final String? error;

  const UnitState({
    this.units = const [],
    this.knowledgesMap = const {},
    this.loadingKnowledges = const {},
    this.isLoading = false,
    this.error,
  });

  UnitState copyWith({
    List<Unit>? units,
    Map<int, List<Knowledge>>? knowledgesMap,
    Map<int, bool>? loadingKnowledges,
    bool? isLoading,
    String? error,
  }) {
    return UnitState(
      units: units ?? this.units,
      knowledgesMap: knowledgesMap ?? this.knowledgesMap,
      loadingKnowledges: loadingKnowledges ?? this.loadingKnowledges,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// 教材筛选状态管理
class TextbookFilterNotifier extends StateNotifier<TextbookFilterState> {
  TextbookFilterNotifier() : super(const TextbookFilterState());

  void setSubject(String? subject) {
    state = state.copyWith(selectedSubject: subject);
  }

  void setGrade(int? grade) {
    state = state.copyWith(selectedGrade: grade);
  }

  void reset() {
    state = const TextbookFilterState();
  }

  /// 获取当前状态（公共方法，用于 Provider 访问）
  TextbookFilterState get currentState => state;
}

/// 单元状态管理
class UnitNotifier extends StateNotifier<UnitState> {
  final TextbookRepository _repository;

  UnitNotifier(this._repository) : super(const UnitState());

  /// 加载单元列表
  Future<void> loadUnits(int textbookId) async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      final units = await _repository.getUnits(textbookId);

      state = state.copyWith(
        units: units,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: ErrorHandler.getErrorMessage(e),
      );
      rethrow;
    }
  }

  /// 加载知识点列表
  Future<void> loadKnowledges(int unitId) async {
    // 如果已经加载过，直接返回
    if (state.knowledgesMap.containsKey(unitId)) {
      return;
    }

    try {
      state = state.copyWith(
        loadingKnowledges: {
          ...state.loadingKnowledges,
          unitId: true,
        },
      );

      final knowledges = await _repository.getKnowledges(unitId);

      state = state.copyWith(
        knowledgesMap: {
          ...state.knowledgesMap,
          unitId: knowledges,
        },
        loadingKnowledges: {
          ...state.loadingKnowledges,
          unitId: false,
        },
      );
    } catch (e) {
      state = state.copyWith(
        loadingKnowledges: {
          ...state.loadingKnowledges,
          unitId: false,
        },
      );
      rethrow;
    }
  }

  /// 刷新单元列表
  Future<void> refresh(int textbookId) async {
    state = const UnitState();
    await loadUnits(textbookId);
  }

  /// 获取当前状态（公共方法，用于 Provider 访问）
  UnitState get currentState => state;
}

/// 教材筛选 Provider (Riverpod 3.x compatible)
final textbookFilterProvider = Provider<TextbookFilterNotifier>((ref) {
  return TextbookFilterNotifier();
});

/// 教材筛选状态 Provider (用于访问状态)
final textbookFilterStateProvider = Provider<TextbookFilterState>((ref) {
  return ref.watch(textbookFilterProvider).currentState;
});

/// 筛选后的教材列表 Provider
/// 从 ProfileProvider 获取教材列表，应用筛选条件
final filteredTextbooksProvider = Provider<List<Textbook>>((ref) {
  final profileState = ref.watch(profileStateProvider);
  final filterState = ref.watch(textbookFilterStateProvider);
  final repository = TextbookRepository.instance;

  var textbooks = profileState.textbooks;

  // 应用筛选
  textbooks = repository.filterTextbooks(
    textbooks: textbooks,
    subject: filterState.selectedSubject,
    grade: filterState.selectedGrade,
  );

  // 排序
  textbooks = repository.sortTextbooks(textbooks);

  return textbooks;
});

/// 单元状态 Provider (Riverpod 3.x compatible)
final unitProvider = Provider.family<UnitNotifier, int>((ref, textbookId) {
  return UnitNotifier(TextbookRepository.instance);
});

/// 单元状态 Provider (用于访问状态)
final unitStateProvider = Provider.family<UnitState, int>((ref, textbookId) {
  return ref.watch(unitProvider(textbookId)).currentState;
});

/// 单元列表 FutureProvider（用于自动加载）
final unitsFutureProvider = FutureProvider.family<List<Unit>, int>((ref, textbookId) async {
  final repository = TextbookRepository.instance;
  return await repository.getUnits(textbookId);
});

/// 知识点列表 FutureProvider
final knowledgesFutureProvider =
    FutureProvider.family<List<Knowledge>, int>((ref, unitId) async {
  final repository = TextbookRepository.instance;
  return await repository.getKnowledges(unitId);
});

