const ts = require('typescript');
const fs = require('fs');
const path = require('path');

/**
 * 改进版 Python 类型生成器
 * 基于 TypeScript Compiler API，提供更准确的类型解析
 */
class ImprovedPythonTypeGenerator {
  constructor() {
    this.program = null;
    this.checker = null;
    this.typeMapping = {
      'string': 'str',
      'number': 'int',
      'boolean': 'bool',
      'any': 'Any',
      'Date': 'datetime'
    };

    this.models = [];
    this.enums = [];
    this.dependencies = new Map();
  }

  generate() {
    console.log('🐍 生成 Python Pydantic 模型...');

    this.initProgram();
    this.parseSourceFiles();
    this.resolveDependencies();
    this.generatePythonFiles();

    console.log('✅ Python 模型生成完成');
  }

  initProgram() {
    const configPath = ts.findConfigFile(
      path.join(__dirname, '..'),
      ts.sys.fileExists,
      'tsconfig.json'
    );

    if (!configPath) {
      throw new Error('tsconfig.json not found');
    }

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    );

    this.program = ts.createProgram(parsed.fileNames, parsed.options);
    this.checker = this.program.getTypeChecker();
  }

  parseSourceFiles() {
    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (!sourceFile.fileName.includes('src/types')) continue;

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isInterfaceDeclaration(node)) {
          const model = this.parseInterface(node);
          this.models.push(model);
        }
        if (ts.isEnumDeclaration(node)) {
          const enumModel = this.parseEnum(node);
          this.enums.push(enumModel);
        }
      });
    }
  }

  parseInterface(node) {
    const name = node.name.text;
    const heritageClauses = node.heritageClauses || [];
    const extendsList = heritageClauses
      .filter(clause => clause.token === ts.SyntaxKind.ExtendsKeyword)
      .flatMap(clause => clause.types.map(type =>
        type.expression ? type.expression.text : type.typeName?.text || 'BaseModel'
      ));

    const fields = [];

    for (const member of node.members) {
      if (ts.isPropertySignature(member)) {
        const field = this.parsePropertySignature(member);
        if (field) {
          fields.push(field);
        }
      }
    }

    return {
      kind: 'interface',
      name,
      extends: extendsList,
      fields,
      node
    };
  }

  parsePropertySignature(member) {
    const name = member.name.text;
    const typeNode = member.type;

    if (!typeNode) {
      console.warn(`Warning: Property ${name} has no type annotation`);
      return null;
    }

    const required = !member.questionToken;
    const type = this.mapTypeNode(typeNode);
    const comment = this.getJSDocComment(member);

    return {
      name,
      required,
      type,
      comment
    };
  }

  parseEnum(node) {
    const name = node.name.text;
    const values = [];

    for (const member of node.members) {
      if (ts.isEnumMember(member)) {
        const enumName = member.name.text;
        let enumValue = enumName;

        if (member.initializer) {
          if (ts.isStringLiteral(member.initializer)) {
            enumValue = member.initializer.text;
          } else {
            enumValue = this.evaluateExpression(member.initializer);
          }
        }

        values.push({
          name: enumName,
          value: enumValue
        });
      }
    }

    return {
      kind: 'enum',
      name,
      values
    };
  }

  mapTypeNode(typeNode) {
    switch (typeNode.kind) {
      case ts.SyntaxKind.StringKeyword:
        return 'str';

      case ts.SyntaxKind.NumberKeyword:
        return 'int';

      case ts.SyntaxKind.BooleanKeyword:
        return 'bool';

      case ts.SyntaxKind.AnyKeyword:
        return 'Any';

      case ts.SyntaxKind.UnknownKeyword:
        return 'Any';

      case ts.SyntaxKind.VoidKeyword:
        return 'None';

      case ts.SyntaxKind.NullKeyword:
        return 'None';

      case ts.SyntaxKind.UndefinedKeyword:
        return 'None';

      case ts.SyntaxKind.ArrayType:
        const elementType = this.mapTypeNode(typeNode.elementType);
        return `List[${elementType}]`;

      case ts.SyntaxKind.UnionType:
        const unionTypes = typeNode.types.map(t => this.mapTypeNode(t));
        const uniqueTypes = [...new Set(unionTypes)];

        // 对于包含 null/undefined 的联合类型，转为 Optional
        const nonNullTypes = uniqueTypes.filter(t => t !== 'None' && t !== 'null');
        if (nonNullTypes.length < uniqueTypes.length && nonNullTypes.length === 1) {
          return `Optional[${nonNullTypes[0]}]`;
        }
        return `Union[${uniqueTypes.join(', ')}]`;

      case ts.SyntaxKind.LiteralType:
        if (ts.isStringLiteral(typeNode.literal)) {
          return 'str';
        }
        if (ts.isNumericLiteral(typeNode.literal)) {
          return 'int';
        }
        if (typeNode.literal.kind === ts.SyntaxKind.TrueKeyword ||
            typeNode.literal.kind === ts.SyntaxKind.FalseKeyword) {
          return 'bool';
        }
        if (typeNode.literal.kind === ts.SyntaxKind.NullKeyword) {
          return 'None';
        }
        return 'Any';

      case ts.SyntaxKind.TupleType:
        const tupleTypes = typeNode.elements.map(t => this.mapTypeNode(t));
        return `Tuple[${tupleTypes.join(', ')}]`;

      case ts.SyntaxKind.TypeReference:
        let typeName = '';
        if (ts.isIdentifier(typeNode.typeName)) {
          typeName = typeNode.typeName.text;
        } else if (typeNode.typeName && typeNode.typeName.right) {
          typeName = typeNode.typeName.right.text;
        }

        if (!typeName) {
          return 'Any';
        }

        if (typeName === 'Array' && typeNode.typeArguments) {
          const argType = this.mapTypeNode(typeNode.typeArguments[0]);
          return `List[${argType}]`;
        }
        if (typeName === 'Record' && typeNode.typeArguments) {
          const keyType = this.mapTypeNode(typeNode.typeArguments[0]);
          const valueType = this.mapTypeNode(typeNode.typeArguments[1]);
          return `Dict[${keyType}, ${valueType}]`;
        }
        if (typeName === 'Optional' && typeNode.typeArguments) {
          const argType = this.mapTypeNode(typeNode.typeArguments[0]);
          return `Optional[${argType}]`;
        }
        if (typeName === 'Promise' && typeNode.typeArguments) {
          const argType = this.mapTypeNode(typeNode.typeArguments[0]);
          return `Awaitable[${argType}]`;
        }
        return typeName;

      default:
        // 静默处理不支持的类型
        return 'Any';
    }
  }

  evaluateExpression(node) {
    // 简单的表达式求值
    if (ts.isStringLiteral(node)) {
      return node.text;
    }
    if (ts.isNumericLiteral(node)) {
      return node.text;
    }
    if (ts.isIdentifier(node)) {
      return node.text;
    }
    return 'Unknown';
  }

  getJSDocComment(node) {
    const jsDocTags = ts.getJSDocTags(node);
    if (jsDocTags.length > 0) {
      return jsDocTags.map(tag => tag.comment?.text || '').join(' ').trim();
    }
    return null;
  }

  resolveDependencies() {
    // 构建依赖关系图
    for (const model of this.models) {
      const deps = new Set();

      for (const field of model.fields) {
        const referencedTypes = this.extractReferencedTypes(field.type);
        for (const refType of referencedTypes) {
          if (this.isCustomType(refType)) {
            deps.add(refType);
          }
        }
      }

      this.dependencies.set(model.name, Array.from(deps));
    }
  }

  extractReferencedTypes(typeString) {
    const types = new Set();
    const regex = /\b([A-Z][a-zA-Z0-9]*)\b/g;
    let match;

    while ((match = regex.exec(typeString)) !== null) {
      types.add(match[1]);
    }

    return Array.from(types);
  }

  isCustomType(typeName) {
    // 检查是否为自定义类型（不是基础 Python 类型）
    const pythonBuiltins = ['str', 'int', 'float', 'bool', 'List', 'Dict', 'Union', 'Optional', 'Any', 'datetime'];
    return !pythonBuiltins.includes(typeName);
  }

  isGenericModel(model) {
    if (!model || !model.fields) return false;

    // 检查字段类型是否包含 TypeVar
    for (const field of model.fields) {
      if (field.type && field.type.includes('T')) {
        return true;
      }
    }
    return false;
  }

  sortByDependency() {
    const visited = new Set();
    const sorted = [];

    const visit = (modelName) => {
      if (visited.has(modelName)) return;
      visited.add(modelName);

      const deps = this.dependencies.get(modelName) || [];
      for (const dep of deps) {
        visit(dep);
      }

      sorted.push(modelName);
    };

    for (const model of this.models) {
      visit(model.name);
    }

    return sorted.map(name => this.models.find(m => m.name === name));
  }

  generatePythonFiles() {
    const outDir = path.join(__dirname, '../build/python');
    fs.mkdirSync(outDir, { recursive: true });

    let content = this.generateHeader();

    // 先生成枚举
    for (const enumModel of this.enums) {
      content += this.generateEnum(enumModel);
      content += '\n\n';
    }

    // 再生成模型（按依赖排序）
    const sortedModels = this.sortByDependency();
    for (const model of sortedModels) {
      try {
        if (!model) {
          console.warn('Warning: Found null model, skipping');
          continue;
        }
        content += this.generateModel(model);
        content += '\n\n';
      } catch (error) {
        console.error(`Error generating model: ${error.message}`);
        console.error(`Model data:`, model);
        continue;
      }
    }

    fs.writeFileSync(path.join(outDir, 'models.py'), content);
  }

  generateHeader() {
    return `"""
Auto-generated Python Pydantic models from TypeScript types.
Generated on: ${new Date().toISOString()}
DO NOT EDIT MANUALLY - Use npm run build:python to regenerate
"""

from typing import Optional, List, Dict, Union, TypeVar, Generic
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field

T = TypeVar('T')

class Config:
    extra = "ignore"
    from_attributes = True

`;
  }

  generateEnum(enumModel) {
    let content = `class ${enumModel.name}(str, Enum):\n`;

    for (const value of enumModel.values) {
      content += `    ${value.name} = "${value.value}"\n`;
    }

    return content;
  }

  generateModel(model) {
    const baseClass = model.extends && model.extends.length > 0 ? model.extends.join(', ') : 'BaseModel';
    let content = `class ${model.name}(${baseClass}):\n`;

    if (model.fields.length === 0) {
      content += '    pass\n';
      return content;
    }

    for (const field of model.fields) {
      // 添加注释
      if (field.comment) {
        const commentLines = field.comment.split('\n');
        for (const line of commentLines) {
          content += `    """${line}"""\n`;
        }
      }

      let pythonType = field.type;
      // 处理前向引用 - 如果是自定义类型，添加字符串引号
      if (this.isCustomType(pythonType) && !pythonType.startsWith('List[') && !pythonType.startsWith('Optional[') && !pythonType.startsWith('Union[') && !pythonType.startsWith('Dict[')) {
        pythonType = `"${pythonType}"`;
      }

      if (field.required) {
        content += `    ${field.name}: ${pythonType}\n`;
      } else {
        content += `    ${field.name}: Optional[${pythonType}] = None\n`;
      }
    }

    // 添加配置
    content += `    class Config:\n        extra = "ignore"\n        from_attributes = True\n`;

    return content;
  }
}

// 运行生成器
if (require.main === module) {
  try {
    new ImprovedPythonTypeGenerator().generate();
  } catch (error) {
    console.error('❌ Python 类型生成失败:', error.message);
    process.exit(1);
  }
}

module.exports = ImprovedPythonTypeGenerator;