#!/usr/bin/env node
/**
 * Cross-platform type consistency validator
 * Ensures type definitions are consistent across all platforms
 */

const fs = require('fs');
const path = require('path');

class ConsistencyValidator {
  constructor() {
    this.typesDir = path.join(__dirname, '../src/types');
    this.pythonDir = path.join(__dirname, '../build/python');
    this.dartDir = path.join(__dirname, '../build/dart');
    this.issues = [];
  }

  validate() {
    console.log('🔍 开始跨平台类型一致性验证...');

    this.validateTypeScriptTypes();
    this.validatePythonTypes();
    this.validateDartTypes();
    this.validateCrossPlatformNaming();
    this.validateEnumConsistency();

    this.reportResults();
  }

  validateTypeScriptTypes() {
    console.log('\n📝 验证 TypeScript 类型...');

    const typeFiles = this.getTypeScriptFiles();
    console.log(`✅ 找到 ${typeFiles.length} 个 TypeScript 类型文件`);

    // 验证类型导出
    const indexFile = path.join(this.typesDir, 'index.ts');
    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf8');
      const exports = content.match(/export .+ from/g) || [];
      console.log(`✅ 类型导出: ${exports.length} 个`);
    }
  }

  validatePythonTypes() {
    console.log('\n🐍 验证 Python 类型...');

    if (!fs.existsSync(this.pythonDir)) {
      this.issues.push('Python 类型目录不存在');
      return;
    }

    const pythonFiles = this.getPythonFiles();
    console.log(`✅ 找到 ${pythonFiles.length} 个 Python 类型文件`);

    // 检查语法
    pythonFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        // 简单的语法检查
        if (content.includes('from typing import')) {
          console.log(`✅ ${path.basename(file)} 包含正确的类型导入`);
        }
      } catch (error) {
        this.issues.push(`Python 文件 ${path.basename(file)} 读取错误: ${error.message}`);
      }
    });
  }

  validateDartTypes() {
    console.log('\n🎯 验证 Dart 类型...');

    if (!fs.existsSync(this.dartDir)) {
      this.issues.push('Dart 类型目录不存在');
      return;
    }

    const dartFiles = this.getDartFiles();
    console.log(`✅ 找到 ${dartFiles.length} 个 Dart 类型文件`);

    // 检查 JsonSerializable 注解
    dartFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('@JsonSerializable()')) {
          console.log(`✅ ${path.basename(file)} 包含 JsonSerializable 注解`);
        }
      } catch (error) {
        this.issues.push(`Dart 文件 ${path.basename(file)} 读取错误: ${error.message}`);
      }
    });
  }

  validateCrossPlatformNaming() {
    console.log('\n🔄 验证跨平台命名一致性...');

    // 检查核心类型是否在各平台都存在
    const coreTypes = [
      'Student', 'Question', 'PracticeSession', 'Textbook',
      'ApiResponse', 'Admin', 'Knowledge', 'Unit'
    ];

    coreTypes.forEach(typeName => {
      const hasTS = this.hasTypeScriptType(typeName);
      const hasPython = this.hasPythonType(typeName);
      const hasDart = this.hasDartType(typeName);

      if (hasTS && hasPython && hasDart) {
        console.log(`✅ ${typeName} 在所有平台都存在`);
      } else {
        this.issues.push(
          `${typeName} 缺失: TS=${hasTS}, Python=${hasPython}, Dart=${hasDart}`
        );
      }
    });
  }

  validateEnumConsistency() {
    console.log('\n🏷️ 验证枚举一致性...');

    const enums = [
      'Subject', 'Grade', 'Status', 'Difficulty', 'QuestionType'
    ];

    enums.forEach(enumName => {
      const tsValues = this.getTypeScriptEnumValues(enumName);
      const pythonValues = this.getPythonEnumValues(enumName);
      const dartValues = this.getDartEnumValues(enumName);

      if (tsValues.length > 0) {
        console.log(`✅ ${enumName}: ${tsValues.length} 个枚举值`);

        // 检查值数量是否一致
        if (pythonValues.length > 0 && pythonValues.length !== tsValues.length) {
          this.issues.push(
            `${enumName} 枚举值数量不一致: TS=${tsValues.length}, Python=${pythonValues.length}`
          );
        }

        if (dartValues.length > 0 && dartValues.length !== tsValues.length) {
          this.issues.push(
            `${enumName} 枚举值数量不一致: TS=${tsValues.length}, Dart=${dartValues.length}`
          );
        }
      }
    });
  }

  // Helper methods
  getTypeScriptFiles() {
    const files = [];
    const walk = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          walk(fullPath);
        } else if (item.endsWith('.ts')) {
          files.push(fullPath);
        }
      });
    };
    walk(this.typesDir);
    return files;
  }

  getPythonFiles() {
    const files = [];
    const walk = (dir) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          walk(fullPath);
        } else if (item.endsWith('.py')) {
          files.push(fullPath);
        }
      });
    };
    walk(this.pythonDir);
    return files;
  }

  getDartFiles() {
    const files = [];
    const walk = (dir) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          walk(fullPath);
        } else if (item.endsWith('.dart')) {
          files.push(fullPath);
        }
      });
    };
    walk(this.dartDir);
    return files;
  }

  hasTypeScriptType(typeName) {
    const files = this.getTypeScriptFiles();
    return files.some(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes(`export interface ${typeName}`) ||
             content.includes(`export class ${typeName}`) ||
             content.includes(`export enum ${typeName}`);
    });
  }

  hasPythonType(typeName) {
    const files = this.getPythonFiles();
    return files.some(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes(`class ${typeName}(`) ||
             content.includes(`class ${typeName}(`);
    });
  }

  hasDartType(typeName) {
    const files = this.getDartFiles();
    return files.some(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes(`class ${typeName} `) ||
             content.includes(`enum ${typeName} `);
    });
  }

  getTypeScriptEnumValues(enumName) {
    const files = this.getTypeScriptFiles();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const enumMatch = new RegExp(`export enum ${enumName}\\s*{([^}]+)}`, 's').exec(content);
      if (enumMatch) {
        const enumBody = enumMatch[1];
        const values = enumBody.split(',').map(line => {
          const match = line.match(/(\w+)\s*=/);
          return match ? match[1] : line.trim();
        }).filter(Boolean);
        return values;
      }
    }
    return [];
  }

  getPythonEnumValues(enumName) {
    const files = this.getPythonFiles();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const enumMatch = new RegExp(`class ${enumName}\\([^)]+\\):([\\s\\S]*?)(?=\\n\\n|\\nclass|\\Z)`, 'm').exec(content);
      if (enumMatch) {
        const enumBody = enumMatch[1];
        const values = enumBody.match(/(\w+)\s*=/g) || [];
        return values.map(match => match.replace('=', '').trim());
      }
    }
    return [];
  }

  getDartEnumValues(enumName) {
    const files = this.getDartFiles();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const enumMatch = new RegExp(`enum ${enumName}\\s*{([^}]+)}`, 's').exec(content);
      if (enumMatch) {
        const enumBody = enumMatch[1];
        const values = enumBody.split(',').map(line => line.trim()).filter(Boolean);
        return values;
      }
    }
    return [];
  }

  reportResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 类型一致性验证结果');
    console.log('='.repeat(50));

    if (this.issues.length === 0) {
      console.log('🎉 所有检查通过！类型定义在所有平台都保持一致');
      process.exit(0);
    } else {
      console.log(`❌ 发现 ${this.issues.length} 个问题:`);
      this.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue}`);
      });
      console.log('\n⚠️ 请修复上述问题后重新验证');
      process.exit(1);
    }
  }
}

// Run validator
const validator = new ConsistencyValidator();
validator.validate();