const fs = require('fs');
const path = require('path');

/**
 * 从 TypeScript 类型生成 Python Pydantic 模型
 */
class PythonTypeGenerator {
  constructor() {
    this.typeMapping = {
      'string': 'str',
      'number': 'int',
      'boolean': 'bool',
      'Date': 'datetime',
      'any': 'Any'
    };

    this.imports = new Set([
      'from pydantic import BaseModel, Field',
      'from typing import Optional, List, Dict, Union',
      'from enum import Enum',
      'from datetime import datetime'
    ]);
  }

  generate() {
    const typesDir = path.join(__dirname, '../src/types');
    const outputDir = path.join(__dirname, '../build/python');

    // 创建输出目录
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 读取所有类型文件
    const typeFiles = fs.readdirSync(typesDir).filter(file => file.endsWith('.ts'));

    let pythonContent = this.generateHeader();
    let models = [];

    for (const file of typeFiles) {
      if (file === 'index.ts') continue;

      const filePath = path.join(typesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      const fileModels = this.parseTypeScriptFile(content, file);
      models.push(...fileModels);
    }

    // 生成所有模型
    for (const model of models) {
      pythonContent += this.generatePythonModel(model);
    }

    // 写入文件
    fs.writeFileSync(path.join(outputDir, 'models.py'), pythonContent);

    console.log('✅ Python types generated successfully!');
    console.log(`📁 Output: ${outputDir}/models.py`);
  }

  generateHeader() {
    return `"""
Auto-generated Python Pydantic models from TypeScript types.
Generated on: ${new Date().toISOString()}
DO NOT EDIT MANUALLY - Use npm run build:python to regenerate
"""

${Array.from(this.imports).join('\n')}

class Config:
    extra = "ignore"
    from_attributes = True

`;
  }

  parseTypeScriptFile(content, filename) {
    const models = [];
    const lines = content.split('\n');

    let currentInterface = null;
    let interfaceLines = [];
    let inInterface = false;
    let inEnum = false;
    let currentEnum = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测接口开始
      if (line.startsWith('export interface ') || line.startsWith('interface ')) {
        const match = line.match(/(?:export )?interface\s+(\w+)/);
        if (match) {
          currentInterface = {
            name: match[1],
            fields: [],
            extends: []
          };
          inInterface = true;

          // 检查继承
          const extendsMatch = line.match(/extends\s+([^{\]+)/);
          if (extendsMatch) {
            currentInterface.extends = extendsMatch[1].split(',').map(e => e.trim());
          }
        }
        continue;
      }

      // 检测枚举开始
      if (line.startsWith('export enum ') || line.startsWith('enum ')) {
        const match = line.match(/(?:export )?enum\s+(\w+)/);
        if (match) {
          currentEnum = {
            name: match[1],
            values: []
          };
          inEnum = true;
        }
        continue;
      }

      // 检测接口结束
      if (inInterface && line === '}' && (i === lines.length - 1 || !lines[i + 1].trim())) {
        if (currentInterface) {
          models.push(currentInterface);
          currentInterface = null;
          inInterface = false;
        }
        continue;
      }

      // 检测枚举结束
      if (inEnum && line === '}' && (i === lines.length - 1 || !lines[i + 1].trim())) {
        if (currentEnum) {
          models.push(currentEnum);
          currentEnum = null;
          inEnum = false;
        }
        continue;
      }

      // 解析接口字段
      if (inInterface && currentInterface && line && !line.startsWith('//') && line.includes(':')) {
        const fieldMatch = line.match(/(\w+)(\??):\s*([^;]+);?\s*(\/\/.*)?$/);
        if (fieldMatch) {
          const [, name, optional, type, comment] = fieldMatch;
          currentInterface.fields.push({
            name,
            required: !optional,
            type: type.trim().replace(/['"]/g, ''),
            comment: comment ? comment.replace('//', '').trim() : ''
          });
        }
      }

      // 解析枚举值
      if (inEnum && currentEnum && line && !line.startsWith('//')) {
        const enumMatch = line.match(/(\w+)\s*=?\s*['"]?([^'"\s,}]+)['"]?/);
        if (enumMatch) {
          const [, name, value] = enumMatch;
          currentEnum.values.push({
            name,
            value: value || name
          });
        }
      }
    }

    return models;
  }

  generatePythonModel(model) {
    let content = '';

    if (model.values) {
      // 生成枚举
      content += `class ${model.name}(str, Enum):\n`;
      for (const value of model.values) {
        content += `    ${value.name} = "${value.value}"\n`;
      }
      content += '\n';
    } else {
      // 生成接口模型
      const baseClass = model.extends.length > 0 ? model.extends.join(', ') : 'BaseModel';
      content += `class ${model.name}(${baseClass}):\n`;

      if (model.fields.length === 0) {
        content += '    pass\n\n';
        return content;
      }

      for (const field of model.fields) {
        const pythonType = this.mapTypeToPython(field.type);
        const required = field.required;

        // 添加注释
        if (field.comment) {
          content += `    """${field.comment}"""\n`;
        }

        // 生成字段
        if (required) {
          content += `    ${field.name}: ${pythonType}\n`;
        } else {
          content += `    ${field.name}: Optional[${pythonType}] = None\n`;
        }
      }

      // 添加配置
      content += `    class Config:\n        extra = "ignore"\n        from_attributes = True\n\n`;
    }

    return content;
  }

  mapTypeToPython(tsType) {
    // 处理数组类型
    if (tsType.endsWith('[]')) {
      const itemType = tsType.slice(0, -2);
      return `List[${this.mapTypeToPython(itemType)}]`;
    }

    // 处理可选类型
    if (tsType.startsWith('Optional<')) {
      const innerType = tsType.slice(9, -1);
      return `Optional[${this.mapTypeToPython(innerType)}]`;
    }

    // 处理联合类型
    if (tsType.includes('|')) {
      const types = tsType.split('|').map(t => t.trim());
      return types.map(t => this.mapTypeToPython(t)).join(', ');
    }

    // 处理记录类型
    if (tsType.startsWith('Record<')) {
      const match = tsType.match(/Record<([^,]+),\s*([^>]+)>/);
      if (match) {
        return `Dict[${this.mapTypeToPython(match[1])}, ${this.mapTypeToPython(match[2])}]`;
      }
    }

    // 基础类型映射
    const mapping = this.typeMapping[tsType];
    if (mapping) return mapping;

    // 如果是已定义的接口/枚举，直接返回名称
    if (this.isCustomType(tsType)) {
      return tsType;
    }

    // 默认返回 Any
    return 'Any';
  }

  isCustomType(typeName) {
    // 简单检查是否为自定义类型（以大写字母开头且不是基础类型）
    return /^[A-Z][a-zA-Z0-9]*$/.test(typeName) && !this.typeMapping[typeName];
  }
}

// 运行生成器
if (require.main === module) {
  const generator = new PythonTypeGenerator();
  generator.generate();
}

module.exports = PythonTypeGenerator;