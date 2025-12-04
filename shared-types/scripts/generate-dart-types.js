const ts = require('typescript');
const fs = require('fs');
const path = require('path');

/**
 * Dart/Flutter 类型生成器
 * 将 TypeScript 接口转换为支持 JsonSerializable 的 Dart 模型
 */
class DartTypeGenerator {
  constructor() {
    this.program = null;
    this.checker = null;
    this.enums = [];
    this.models = [];
    this.camelCaseMap = new Map();
  }

  generate() {
    console.log('🐦 生成 Dart/Flutter 模型...');

    this.initProgram();
    this.parseSourceFiles();
    this.resolveNaming();
    this.generateDartFiles();

    console.log('✅ Dart 模型生成完成');
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
      .flatMap(clause => clause.types.map(type => type.expression.text));

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
      originalName: name,
      dartName: this.toCamelCase(name),
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
        return 'String';

      case ts.SyntaxKind.NumberKeyword:
        return 'int';

      case ts.SyntaxKind.BooleanKeyword:
        return 'bool';

      case ts.SyntaxKind.ArrayType:
        const elementType = this.mapTypeNode(typeNode.elementType);
        return `List<${elementType}>`;

      case ts.SyntaxKind.UnionType:
        const unionTypes = typeNode.types.map(t => this.mapTypeNode(t));
        // 对于包含 null 的联合类型，使用可空类型
        const nonNullTypes = unionTypes.filter(t => t !== 'Null');
        if (nonNullTypes.length < unionTypes.length) {
          return nonNullTypes.length === 1 ? nonNullTypes[0] : `dynamic`;
        }
        return 'dynamic';

      case ts.SyntaxKind.LiteralType:
        if (ts.isStringLiteral(typeNode.literal)) {
          return 'String';
        }
        if (typeNode.literal.kind === ts.SyntaxKind.NullKeyword) {
          return 'Null';
        }
        return 'int';

      case ts.SyntaxKind.TypeReference:
        const typeName = typeNode.typeName.text;
        if (typeName === 'Array' && typeNode.typeArguments) {
          const argType = this.mapTypeNode(typeNode.typeArguments[0]);
          return `List<${argType}>`;
        }
        if (typeName === 'Record' && typeNode.typeArguments) {
          const valueType = this.mapTypeNode(typeNode.typeArguments[1]);
          return `Map<String, ${valueType}>`;
        }
        if (typeName === 'Optional' && typeNode.typeArguments) {
          const argType = this.mapTypeNode(typeNode.typeArguments[0]);
          return `${argType}?`;
        }
        return typeName;

      default:
        console.warn(`Unsupported type kind: ${ts.SyntaxKind[typeNode.kind]}`);
        return 'dynamic';
    }
  }

  evaluateExpression(node) {
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

  toCamelCase(str) {
    // snake_case 转 camelCase
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  resolveNaming() {
    // 收集所有需要映射的字段名
    for (const model of this.models) {
      for (const field of model.fields) {
        if (field.originalName !== field.dartName) {
          this.camelCaseMap.set(field.originalName, field.dartName);
        }
      }
    }
  }

  generateDartFiles() {
    const outDir = path.join(__dirname, '../build/dart');
    fs.mkdirSync(outDir, { recursive: true });

    // 生成枚举文件
    this.generateEnumsFile(outDir);

    // 生成模型文件
    this.generateModelsFile(outDir);

    // 生成统一导出文件
    this.generateSharedTypesFile(outDir);
  }

  generateEnumsFile(outDir) {
    let content = `/// Auto-generated Dart enums from TypeScript types.
/// Generated on: ${new Date().toISOString()}

`;

    for (const enumModel of this.enums) {
      content += this.generateDartEnum(enumModel);
      content += '\n\n';
    }

    fs.writeFileSync(path.join(outDir, 'enums.dart'), content);
  }

  generateDartEnum(enumModel) {
    let content = `enum ${enumModel.name} {\n`;

    for (const value of enumModel.values) {
      content += `  ${value.name},\n`;
    }

    content += `}\n\n`;

    content += `extension ${enumModel.name}Extension on ${enumModel.name} {
  String get value {
    switch (this) {\n`;

    for (const value of enumModel.values) {
      content += `      case ${enumModel.name}.${value.name}:\n        return '${value.value}';\n`;
    }

    content += `    }
  }

  static ${enumModel.name} fromValue(String value) {
    switch (value) {\n`;

    for (const value of enumModel.values) {
      content += `      case '${value.value}':\n        return ${enumModel.name}.${value.name};\n`;
    }

    content += `      default:\n        throw ArgumentError('Unknown enum value: \$value');\n    }
  }\n`;

    content += `}`;

    return content;
  }

  generateModelsFile(outDir) {
    let content = `/// Auto-generated Dart models from TypeScript types.
/// Generated on: ${new Date().toISOString()}

import 'package:json_annotation/json_annotation.dart';
import 'enums.dart';

`;

    // 生成所有模型
    for (const model of this.models) {
      content += this.generateDartModel(model);
      content += '\n\n';
    }

    fs.writeFileSync(path.join(outDir, 'models.dart'), content);
  }

  generateDartModel(model) {
    let content = '';

    // 生成@JsonSerializable()注解
    content += '@JsonSerializable()\n';

    const baseClass = model.extends.length > 0 ? model.extends[0] : null;
    content += `class ${model.name} ${baseClass ? `extends ${baseClass} ` : ''}{\n`;

    if (model.fields.length === 0) {
      content += `  const ${model.name}();\n`;
    } else {
      // 生成字段
      for (const field of model.fields) {
        // 添加注释
        if (field.comment) {
          content += `  /// ${field.comment}\n`;
        }

        // 生成字段定义
        const optionalStr = field.required ? '' : '?';
        if (field.originalName === field.dartName) {
          content += `  final ${field.type}${optionalStr} ${field.dartName};\n`;
        } else {
          content += `  @JsonKey(name: '${field.originalName}')\n`;
          content += `  final ${field.type}${optionalStr} ${field.dartName};\n`;
        }
      }

      // 生成构造函数
      content += `\n  const ${model.name}({\n`;
      for (const field of model.fields) {
        if (field.required) {
          content += `    required this.${field.dartName},\n`;
        } else {
          content += `    this.${field.dartName},\n`;
        }
      }
      content += '  });\n\n';

      // 生成序列化方法
      content += `  factory ${model.name}.fromJson(Map<String, dynamic> json) =>`;
      content += ` _\$${model.name}FromJson(json);\n\n`;
      content += `  Map<String, dynamic> toJson() => _\$${model.name}ToJson(this);\n`;
    }

    content += '}';

    return content;
  }

  generateSharedTypesFile(outDir) {
    let content = `/// Auto-generated shared types export.
/// Generated on: ${new Date().toISOString()}

export 'enums.dart';
export 'models.dart';
`;

    fs.writeFileSync(path.join(outDir, 'shared_types.dart'), content);
  }
}

// 运行生成器
if (require.main === module) {
  try {
    new DartTypeGenerator().generate();
  } catch (error) {
    console.error('❌ Dart 类型生成失败:', error.message);
    process.exit(1);
  }
}

module.exports = DartTypeGenerator;