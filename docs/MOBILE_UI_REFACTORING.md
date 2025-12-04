# Flutter 移动端 UI 重构方案

> 基于设计稿的游戏化风格，重构 Flutter 移动应用的 UI 系统

## 一、设计系统重构

### 1.1 颜色系统重构

**当前问题**：颜色偏商务化，缺少游戏化元素

**重构方案**：创建游戏化颜色系统

```dart
// lib/core/theme/gamified_colors.dart
class GamifiedColors {
  // 角色色彩系统
  static const Color studentYellow = Color(0xFFFFD700);      // 学生角色 - 金黄色
  static const Color teacherGreen = Color(0xFF10B981);       // 教师角色 - 翠绿色
  static const Color schoolPink = Color(0xFFEC4899);         // 学校角色 - 粉红色
  
  // 功能色彩
  static const Color successGreen = Color(0xFF10B981);        // 正确/成功
  static const Color errorRed = Color(0xFFEF4444);            // 错误
  static const Color warningAmber = Color(0xFFF59E0B);         // 警告
  static const Color infoBlue = Color(0xFF3B82F6);           // 信息
  
  // 游戏化元素
  static const Color coinGold = Color(0xFFFFD700);            // 金币
  static const Color diamondBlue = Color(0xFF3B82F6);          // 钻石
  static const Color trophyAmber = Color(0xFFFFB800);         // 奖杯
  
  // 背景渐变
  static const List<Color> gradientPrimary = [
    Color(0xFFE0F2FE),  // 浅蓝
    Color(0xFFFFFFFF),  // 白色
  ];
  
  static const List<Color> gradientSuccess = [
    Color(0xFFD1FAE5),  // 浅绿
    Color(0xFFFFFFFF),
  ];
  
  static const List<Color> gradientWarning = [
    Color(0xFFFEF3C7),  // 浅黄
    Color(0xFFFFFFFF),
  ];
}
```

### 1.2 主题系统增强

**重构要点**：
- 增加圆角半径（16px → 24px）
- 增强阴影效果
- 添加渐变背景支持
- 优化按钮样式（更大、更圆润）

```dart
// lib/core/theme/gamified_theme.dart
class GamifiedTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      // 圆角系统
      cardTheme: CardTheme(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24), // 从 12 增加到 24
        ),
        elevation: 4, // 增强阴影
      ),
      // 按钮样式
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20), // 更圆润
          ),
          elevation: 4,
          shadowColor: Colors.black.withOpacity(0.2),
        ),
      ),
      // 输入框样式
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16), // 从 8 增加到 16
        ),
        filled: true,
        fillColor: Colors.white,
      ),
    );
  }
}
```

## 二、核心组件重构

### 2.1 按钮组件系统

**设计稿特点**：大按钮、全宽、颜色区分功能

```dart
// lib/shared/widgets/buttons/gamified_button.dart
enum ButtonType {
  student,
  teacher,
  school,
  success,
  error,
  primary,
}

class GamifiedButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final ButtonType type; // student, teacher, school, success, error
  final bool isFullWidth;
  final IconData? icon;
  
  const GamifiedButton({
    super.key,
    required this.label,
    this.onPressed,
    this.type = ButtonType.student,
    this.isFullWidth = true,
    this.icon,
  });
  
  Color _getColor() {
    switch (type) {
      case ButtonType.student:
        return GamifiedColors.studentYellow;
      case ButtonType.teacher:
        return GamifiedColors.teacherGreen;
      case ButtonType.school:
        return GamifiedColors.schoolPink;
      case ButtonType.success:
        return GamifiedColors.successGreen;
      case ButtonType.error:
        return GamifiedColors.errorRed;
      case ButtonType.primary:
        return GamifiedColors.infoBlue;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: _getColor(),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          elevation: 6,
          shadowColor: _getColor().withOpacity(0.4),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 20),
              const SizedBox(width: 8),
            ],
            Text(
              label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 2.2 卡片组件增强

**设计稿特点**：大圆角、渐变背景、插画支持

```dart
// lib/shared/widgets/cards/gamified_card.dart
class GamifiedCard extends StatelessWidget {
  final Widget child;
  final Color? borderColor;
  final List<Color>? gradientColors;
  final Widget? illustration; // 插画组件
  final double? elevation;
  
  const GamifiedCard({
    super.key,
    required this.child,
    this.borderColor,
    this.gradientColors,
    this.illustration,
    this.elevation = 4,
  });
  
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: gradientColors != null
            ? LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: gradientColors!,
              )
            : null,
        color: gradientColors == null ? Colors.white : null,
        borderRadius: BorderRadius.circular(24),
        border: borderColor != null
            ? Border.all(color: borderColor!, width: 2)
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          if (illustration != null)
            Positioned(
              right: -20,
              top: -20,
              child: Opacity(
                opacity: 0.1,
                child: illustration!,
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: child,
          ),
        ],
      ),
    );
  }
}
```

### 2.3 进度指示器组件

**设计稿特点**：圆形进度点、大号显示

```dart
// lib/shared/widgets/progress/circle_progress_indicator.dart
class CircleProgressIndicator extends StatelessWidget {
  final int current;
  final int total;
  final double size;
  
  const CircleProgressIndicator({
    super.key,
    required this.current,
    required this.total,
    this.size = 12,
  });
  
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(total, (index) {
        final isActive = index < current;
        return Container(
          width: size,
          height: size,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive
                ? GamifiedColors.primary
                : Colors.grey.shade300,
            border: Border.all(
              color: isActive
                  ? GamifiedColors.primary
                  : Colors.grey.shade400,
              width: 2,
            ),
          ),
        );
      }),
    );
  }
}
```

## 三、页面重构方案

### 3.1 登录/注册页面重构

**设计稿特点**：
- 角色选择（Student/Teacher/School）
- 大插画展示
- 分段控制器
- 颜色区分角色

**重构方案**：

```dart
// lib/features/auth/presentation/pages/role_selection_page.dart
class RoleSelectionPage extends StatelessWidget {
  const RoleSelectionPage({super.key});
  
  void _navigateToLogin(BuildContext context, String role) {
    context.push('/login', extra: {'role': role});
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: GamifiedColors.gradientPrimary,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // 大插画
              Expanded(
                child: Center(
                  child: Image.asset(
                    'assets/illustrations/students_gathering.png',
                    height: 300,
                  ),
                ),
              ),
              // 标题
              const Text(
                'A milestone to reach your dream',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 24),
              // 角色选择按钮
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    GamifiedButton(
                      label: 'Student',
                      type: ButtonType.student,
                      icon: Icons.person_outline,
                      onPressed: () => _navigateToLogin(context, 'student'),
                    ),
                    const SizedBox(height: 16),
                    GamifiedButton(
                      label: 'Teacher',
                      type: ButtonType.teacher,
                      icon: Icons.school_outlined,
                      onPressed: () => _navigateToLogin(context, 'teacher'),
                    ),
                    const SizedBox(height: 16),
                    GamifiedButton(
                      label: 'School',
                      type: ButtonType.school,
                      icon: Icons.business_outlined,
                      onPressed: () => _navigateToLogin(context, 'school'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 3.2 首页重构

**设计稿特点**：
- 欢迎卡片带插画
- 进度条显示
- 推荐内容卡片
- 底部导航栏

**重构方案**：

```dart
// lib/features/home/presentation/pages/gamified_home_page.dart
class GamifiedHomePage extends StatelessWidget {
  const GamifiedHomePage({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: GamifiedColors.gradientPrimary,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // 顶部栏
              _buildTopBar(context),
              // 内容区域
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 欢迎卡片（带插画）
                      _buildWelcomeCard(context),
                      const SizedBox(height: 24),
                      // 学习进度
                      _buildProgressSection(context),
                      const SizedBox(height: 24),
                      // 推荐内容
                      _buildRecommendedSection(context),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNavBar(context),
    );
  }
  
  Widget _buildWelcomeCard(BuildContext context) {
    return GamifiedCard(
      gradientColors: [Colors.white, Colors.blue.shade50],
      illustration: Image.asset('assets/illustrations/student_desk.png'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ready to learn?',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 16),
          // 进度条
          LinearProgressIndicator(
            value: 0.25,
            backgroundColor: Colors.grey.shade200,
            valueColor: AlwaysStoppedAnimation<Color>(
              GamifiedColors.primary,
            ),
            minHeight: 8,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      ),
    );
  }
  
  Widget _buildTopBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.of(context).pop(),
          ),
          const Expanded(
            child: Text(
              'H. Budi Budiman',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.push('/profile'),
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
    );
  }
  
  Widget _buildBottomNavBar(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.book),
          label: 'Book',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.emoji_events),
          label: 'Trophy',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Person',
        ),
      ],
    );
  }
}
```

### 3.3 练习页面重构

**设计稿特点**：
- 大号题目显示
- 选项按钮（A/B/C/D）
- 即时反馈（✓/✗）
- 解释面板

**重构方案**：

```dart
// lib/features/practice/session/presentation/widgets/gamified_question_card.dart
class GamifiedQuestionCard extends StatelessWidget {
  final Question question;
  final int currentIndex;
  final int totalQuestions;
  final AnswerStatus? answerStatus;
  final String? explanation;
  
  const GamifiedQuestionCard({
    super.key,
    required this.question,
    required this.currentIndex,
    required this.totalQuestions,
    this.answerStatus,
    this.explanation,
  });
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // 进度指示器
        CircleProgressIndicator(
          current: currentIndex + 1,
          total: totalQuestions,
        ),
        const SizedBox(height: 24),
        // 题目卡片
        GamifiedCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 题目内容（大字体）
              Text(
                question.content,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 24),
              // 选项按钮
              if (question.type == 'choice')
                ...question.options!.split('\n').asMap().entries.map((entry) {
                  final index = entry.key;
                  final option = entry.value.trim();
                  final label = String.fromCharCode(65 + index); // A, B, C, D
                  
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _buildOptionButton(
                      context,
                      label: label,
                      text: option,
                      isSelected: answerStatus != null,
                      isCorrect: answerStatus == AnswerStatus.correct,
                    ),
                  );
                }),
            ],
          ),
        ),
        // 反馈区域
        if (answerStatus != null) ...[
          const SizedBox(height: 24),
          _buildFeedbackCard(context),
        ],
        // 解释区域
        if (explanation != null) ...[
          const SizedBox(height: 16),
          _buildExplanationCard(context, explanation!),
        ],
      ],
    );
  }
  
  Widget _buildOptionButton(
    BuildContext context, {
    required String label,
    required String text,
    required bool isSelected,
    required bool isCorrect,
  }) {
    Color backgroundColor = Colors.white;
    Color borderColor = Colors.grey.shade300;
    
    if (isSelected) {
      backgroundColor = isCorrect
          ? GamifiedColors.successGreen.withOpacity(0.1)
          : GamifiedColors.errorRed.withOpacity(0.1);
      borderColor = isCorrect
          ? GamifiedColors.successGreen
          : GamifiedColors.errorRed;
    }
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 2),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: borderColor,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildFeedbackCard(BuildContext context) {
    final isCorrect = answerStatus == AnswerStatus.correct;
    
    return GamifiedCard(
      gradientColors: isCorrect
          ? GamifiedColors.gradientSuccess
          : [GamifiedColors.errorRed.withOpacity(0.1), Colors.white],
      borderColor: isCorrect
          ? GamifiedColors.successGreen
          : GamifiedColors.errorRed,
      child: Column(
        children: [
          Icon(
            isCorrect ? Icons.check_circle : Icons.cancel,
            size: 64,
            color: isCorrect
                ? GamifiedColors.successGreen
                : GamifiedColors.errorRed,
          ),
          const SizedBox(height: 16),
          Text(
            isCorrect ? 'Correct answer!' : 'Wrong answer!',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isCorrect
                  ? GamifiedColors.successGreen
                  : GamifiedColors.errorRed,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildExplanationCard(BuildContext context, String explanation) {
    return GamifiedCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Explanation',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            explanation,
            style: const TextStyle(
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
```

### 3.4 结果页面重构

**设计稿特点**：
- 大号正确率显示
- 统计卡片网格
- 奖杯图标
- 鼓励性文案

**重构方案**：

```dart
// lib/features/practice/session/presentation/pages/gamified_result_panel.dart
class GamifiedResultPanel extends StatelessWidget {
  final PracticeReport report;
  
  const GamifiedResultPanel({
    super.key,
    required this.report,
  });
  
  Map<String, dynamic> _getGrade(int accuracy) {
    if (accuracy >= 90) {
      return {
        'emoji': '🌟',
        'text': '太棒了！',
        'color': Colors.amber,
      };
    } else if (accuracy >= 70) {
      return {
        'emoji': '👍',
        'text': '做得不错！',
        'color': Colors.blue,
      };
    } else if (accuracy >= 50) {
      return {
        'emoji': '💪',
        'text': '继续加油！',
        'color': Colors.orange,
      };
    } else {
      return {
        'emoji': '🙌',
        'text': '再接再厉！',
        'color': Colors.grey,
      };
    }
  }
  
  String _formatTime(int seconds) {
    if (seconds < 60) return '$seconds秒';
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return secs > 0 ? '$minutes分$secs秒' : '$minutes分钟';
  }
  
  @override
  Widget build(BuildContext context) {
    final totalQuestions = report.totalQuestions;
    final correctQuestions = report.correctQuestions;
    final score = report.overallScore;
    final totalTime = report.totalTime;
    final accuracy = totalQuestions > 0
        ? ((correctQuestions / totalQuestions) * 100).round()
        : 0;
    
    final grade = _getGrade(accuracy);
    
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: GamifiedColors.gradientPrimary,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: GamifiedCard(
                borderColor: GamifiedColors.primary,
                child: Column(
                  children: [
                    // 标题区（带奖杯）
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: GamifiedColors.primary,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(
                            Icons.emoji_events,
                            color: Colors.white,
                            size: 40,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                '练习完成！',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '${grade['emoji']} ${grade['text']}',
                                style: TextStyle(
                                  color: grade['color'] as Color,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    // 核心数据 - 正确率（超大号）
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Column(
                        children: [
                          Text(
                            '$accuracy%',
                            style: TextStyle(
                              fontSize: 64,
                              fontWeight: FontWeight.bold,
                              color: GamifiedColors.primary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            '正确率',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    // 统计网格
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 2.2,
                      children: [
                        _buildStatCard(
                          icon: Icons.check_circle,
                          iconColor: GamifiedColors.successGreen,
                          value: correctQuestions.toString(),
                          label: '正确',
                        ),
                        _buildStatCard(
                          icon: Icons.cancel,
                          iconColor: GamifiedColors.errorRed,
                          value: (totalQuestions - correctQuestions).toString(),
                          label: '错误',
                        ),
                        _buildStatCard(
                          icon: Icons.star,
                          iconColor: GamifiedColors.trophyAmber,
                          value: score.toStringAsFixed(0),
                          label: '得分',
                        ),
                        _buildStatCard(
                          icon: Icons.access_time,
                          iconColor: GamifiedColors.infoBlue,
                          value: _formatTime(totalTime),
                          label: '用时',
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    // 操作按钮
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => context.go('/home'),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                            child: const Text('返回'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: GamifiedButton(
                            label: '历史记录',
                            type: ButtonType.primary,
                            icon: Icons.history,
                            onPressed: () => context.go('/practice/history'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildStatCard({
    required IconData icon,
    required Color iconColor,
    required String value,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        children: [
          Icon(icon, color: iconColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

## 四、动画和交互增强

### 4.1 答题反馈动画

```dart
// lib/shared/widgets/animations/answer_feedback_animation.dart
class AnswerFeedbackAnimation extends StatefulWidget {
  final bool isCorrect;
  final Widget child;
  
  const AnswerFeedbackAnimation({
    super.key,
    required this.isCorrect,
    required this.child,
  });
  
  @override
  State<AnswerFeedbackAnimation> createState() => _AnswerFeedbackAnimationState();
}

class _AnswerFeedbackAnimationState extends State<AnswerFeedbackAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.2), weight: 1),
      TweenSequenceItem(tween: Tween(begin: 1.2, end: 1.0), weight: 1),
    ]).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.elasticOut,
    ));
    
    _rotationAnimation = Tween<double>(begin: 0, end: 0.1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    
    _controller.forward();
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Transform.rotate(
            angle: _rotationAnimation.value,
            child: widget.child,
          ),
        );
      },
    );
  }
}
```

### 4.2 进度条动画

```dart
// lib/shared/widgets/progress/animated_progress_bar.dart
class AnimatedProgressBar extends StatefulWidget {
  final double value;
  final Color color;
  
  const AnimatedProgressBar({
    super.key,
    required this.value,
    required this.color,
  });
  
  @override
  State<AnimatedProgressBar> createState() => _AnimatedProgressBarState();
}

class _AnimatedProgressBarState extends State<AnimatedProgressBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _animation = Tween<double>(begin: 0, end: widget.value).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
    _controller.forward();
  }
  
  @override
  void didUpdateWidget(AnimatedProgressBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      _animation = Tween<double>(begin: oldWidget.value, end: widget.value).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeOut),
      );
      _controller.forward(from: 0);
    }
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return LinearProgressIndicator(
          value: _animation.value,
          backgroundColor: Colors.grey.shade200,
          valueColor: AlwaysStoppedAnimation<Color>(widget.color),
          minHeight: 8,
          borderRadius: BorderRadius.circular(4),
        );
      },
    );
  }
}
```

## 五、资源集成

### 5.1 插画资源

需要添加的插画资源：
- `assets/illustrations/students_gathering.png` - 学生聚集插画
- `assets/illustrations/student_desk.png` - 学生桌面插画
- `assets/illustrations/learning_scene.png` - 学习场景插画

### 5.2 图标资源

使用 Flutter 内置图标 + 自定义图标：
- 奖杯图标：`Icons.emoji_events`
- 正确/错误：`Icons.check_circle` / `Icons.cancel`
- 角色图标：`Icons.person`, `Icons.school`, `Icons.business`

### 5.3 pubspec.yaml 配置

```yaml
flutter:
  assets:
    - assets/illustrations/
    - assets/icons/
```

## 六、实施计划

### 阶段一：设计系统基础（1-2周）
1. ✅ 创建 `GamifiedColors` 颜色系统
2. ✅ 重构 `AppTheme` 主题配置
3. ✅ 创建基础组件库（按钮、卡片、进度条）

### 阶段二：核心页面重构（2-3周）
1. ✅ 登录/注册页面重构
2. ✅ 首页重构（欢迎卡片、进度显示）
3. ✅ 练习页面重构（题目卡片、选项按钮、反馈）

### 阶段三：高级功能（1-2周）
1. ✅ 结果页面重构
2. ✅ 报告页面重构（图表、排名）
3. ✅ 动画效果集成

### 阶段四：优化和测试（1周）
1. ✅ 性能优化
2. ✅ 交互测试
3. ✅ UI/UX 细节调整

## 七、技术要点

### 7.1 性能优化
- 使用 `const` 构造函数
- 图片缓存（已有 `cached_network_image`）
- 列表虚拟化（`ListView.builder`）
- 避免不必要的重建（`const` 关键字）

### 7.2 响应式设计
- 使用 `MediaQuery` 适配不同屏幕
- 弹性布局（`Flexible`, `Expanded`）
- 安全区域处理（`SafeArea`）
- 字体大小自适应

### 7.3 可访问性
- 语义化标签（`Semantics`）
- 颜色对比度符合 WCAG 标准
- 字体大小可调节
- 支持屏幕阅读器

## 八、代码示例文件结构

```
mobile/lib/
├── core/
│   └── theme/
│       ├── gamified_colors.dart      # 游戏化颜色系统
│       ├── gamified_theme.dart       # 游戏化主题
│       └── app_theme.dart            # 原有主题（保留兼容）
├── shared/
│   └── widgets/
│       ├── buttons/
│       │   └── gamified_button.dart  # 游戏化按钮
│       ├── cards/
│       │   └── gamified_card.dart    # 游戏化卡片
│       ├── progress/
│       │   ├── circle_progress_indicator.dart
│       │   └── animated_progress_bar.dart
│       └── animations/
│           └── answer_feedback_animation.dart
└── features/
    ├── auth/
    │   └── presentation/
    │       └── pages/
    │           └── role_selection_page.dart
    ├── home/
    │   └── presentation/
    │       └── pages/
    │           └── gamified_home_page.dart
    └── practice/
        └── session/
            └── presentation/
                ├── pages/
                │   └── gamified_result_panel.dart
                └── widgets/
                    └── gamified_question_card.dart
```

## 九、设计原则

### 9.1 视觉层次
- **主要操作**：使用鲜艳颜色（黄色、绿色、粉色）
- **次要操作**：使用灰色或边框样式
- **信息展示**：使用卡片和渐变背景

### 9.2 交互反馈
- **即时反馈**：答题后立即显示结果
- **视觉反馈**：颜色变化、图标动画
- **文字反馈**：鼓励性文案和评价

### 9.3 游戏化元素
- **进度可视化**：圆形进度点、进度条
- **成就系统**：奖杯、星星、等级
- **积分系统**：金币、钻石、分数

## 十、迁移策略

### 10.1 渐进式迁移
1. 先创建新的组件库，不影响现有功能
2. 逐个页面迁移，保持向后兼容
3. 逐步替换旧组件为新组件

### 10.2 兼容性处理
- 保留原有主题系统
- 新组件与旧组件可以共存
- 通过配置开关控制使用新/旧UI

### 10.3 测试策略
- 单元测试：组件功能测试
- 集成测试：页面流程测试
- UI测试：视觉回归测试

## 十一、参考资源

### 11.1 设计稿分析
- 角色选择界面：Student/Teacher/School 三种角色
- 登录界面：分段控制器、大按钮
- 首页：欢迎卡片、进度条、推荐内容
- 练习界面：大号题目、选项按钮、即时反馈
- 结果界面：大号正确率、统计卡片、鼓励文案

### 11.2 技术参考
- Flutter Material Design 3
- 游戏化设计模式
- 移动端UI最佳实践

---

**文档版本**: 1.0  
**最后更新**: 2024年  
**维护者**: 开发团队

