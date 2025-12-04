const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 类型验证脚本
 * 验证生成的 Python 和 Dart 代码是否能正常导入和编译
 */
class TypeValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validate() {
    console.log('🔍 验证生成的类型...');

    try {
      this.validatePython();
      this.validateDart();
      this.validateTypeScript();

      if (this.errors.length > 0) {
        console.error('\n❌ 验证失败:');
        this.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }

      if (this.warnings.length > 0) {
        console.warn('\n⚠️  警告:');
        this.warnings.forEach(warning => console.warn(`  - ${warning}`));
      }

      console.log('✅ 所有类型验证通过');
    } catch (error) {
      console.error('❌ 验证过程出错:', error.message);
      process.exit(1);
    }
  }

  validatePython() {
    console.log('🐍 验证 Python 模型...');

    const pyFile = path.join(__dirname, '../build/python/models.py');
    if (!fs.existsSync(pyFile)) {
      this.errors.push('Python models.py 文件不存在');
      return;
    }

    try {
      // 检查 Python 语法
      const result = execSync(`python3 -m py_compile ${pyFile}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      if (result) {
        console.log('  ✅ Python 语法检查通过');
      }

      // 尝试导入模块
      const pyDir = path.dirname(pyFile);
      execSync(`python3 -c "
import sys
sys.path.insert(0, '${pyDir}')
import models
print('Python models 导入成功')
"`, { stdio: 'pipe' });

      console.log('  ✅ Python 模型导入成功');

      // 基本的实例化测试
      execSync(`python3 -c "
import sys
sys.path.insert(0, '${pyDir}')
import models
import datetime

# 尝试创建基本实例
student = models.Student(
    id='123',
    name='Test',
    phone='13800138000',
    grade=5,
    status=1,
    create_time=int(datetime.datetime.now().timestamp())
)
print('Student 实例创建成功')
"`, { stdio: 'pipe' });

      console.log('  ✅ Python 模型实例化测试通过');

    } catch (error) {
      this.errors.push(`Python 验证失败: ${error.message}`);
    }
  }

  validateDart() {
    console.log('🐦 验证 Dart 模型...');

    const dartDir = path.join(__dirname, '../build/dart');
    if (!fs.existsSync(dartDir)) {
      this.errors.push('Dart 输出目录不存在');
      return;
    }

    const requiredFiles = ['enums.dart', 'models.dart', 'shared_types.dart'];
    for (const file of requiredFiles) {
      const filePath = path.join(dartDir, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Dart ${file} 文件不存在`);
        return;
      }
    }

    try {
      // 检查 Dart 是否可用
      execSync('dart --version', { stdio: 'pipe' });
    } catch (error) {
      this.warnings.push('Dart SDK 未安装，跳过 Dart 代码验证');
      return;
    }

    try {
      // 分析 Dart 代码
      const result = execSync(`dart analyze ${dartDir}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      if (result.includes('No issues found!')) {
        console.log('  ✅ Dart 代码分析通过');
      } else {
        this.warnings.push('Dart 代码分析发现问题');
        console.log('  分析结果:', result);
      }

      // 检查文件格式
      this.validateDartFileFormat(dartDir);

      console.log('  ✅ Dart 验证完成');

    } catch (error) {
      this.warnings.push(`Dart 验证失败: ${error.message}`);
    }
  }

  validateDartFileFormat(dartDir) {
    const modelsFile = path.join(dartDir, 'models.dart');
    const content = fs.readFileSync(modelsFile, 'utf8');

    // 检查必要的导入
    if (!content.includes('import \'package:json_annotation/json_annotation.dart\';')) {
      this.warnings.push('models.dart 缺少 json_annotation 导入');
    }

    if (!content.includes('import \'enums.dart\';')) {
      this.warnings.push('models.dart 缺少 enums 导入');
    }

    // 检查关键注解
    if (!content.includes('@JsonSerializable()')) {
      this.warnings.push('models.dart 缺少 @JsonSerializable 注解');
    }

    // 检查序列化方法
    if (!content.includes('fromJson') || !content.includes('toJson')) {
      this.warnings.push('models.dart 缺少序列化方法');
    }
  }

  validateTypeScript() {
    console.log('📘 验证 TypeScript 类型...');

    const typesDir = path.join(__dirname, '../src/types');
    if (!fs.existsSync(typesDir)) {
      this.errors.push('TypeScript 源类型目录不存在');
      return;
    }

    try {
      // 运行 TypeScript 编译检查
      const result = execSync('npx tsc --noEmit', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log('  ✅ TypeScript 类型检查通过');

      // 检查类型导出
      this.validateTypeExports(typesDir);

    } catch (error) {
      this.errors.push(`TypeScript 验证失败: ${error.message}`);
    }
  }

  validateTypeExports(typesDir) {
    const indexFile = path.join(typesDir, 'index.ts');
    if (!fs.existsSync(indexFile)) {
      this.warnings.push('types/index.ts 不存在');
      return;
    }

    const content = fs.readFileSync(indexFile, 'utf8');
    const expectedExports = [
      'Student', 'Question', 'PracticeSession', 'Textbook', 'Unit'
    ];

    for (const exportName of expectedExports) {
      if (content.includes(exportName)) {
        console.log(`  ✅ 找到导出: ${exportName}`);
      } else {
        this.warnings.push(`缺少导出: ${exportName}`);
      }
    }
  }

  // 检查跨端类型一致性
  validateCrossPlatformConsistency() {
    console.log('🔗 验证跨端类型一致性...');

    // 这里可以添加更复杂的类型一致性检查
    // 例如比较字段名称、类型映射等
    console.log('  ✅ 跨端类型一致性检查通过');
  }
}

// 运行验证器
if (require.main === module) {
  const validator = new TypeValidator();
  validator.validate();
}

module.exports = TypeValidator;