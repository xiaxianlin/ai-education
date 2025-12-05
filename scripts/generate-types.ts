#!/usr/bin/env tsx
/**
 * 从 FastAPI OpenAPI schema 生成 TypeScript 类型
 * 
 * 使用方法:
 * 1. 确保后端服务运行在 http://localhost:7890
 * 2. 运行: pnpm generate:types
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:7890';
const OPENAPI_URL = `${SERVER_URL}/openapi.json`;
const OUTPUT_PATH = path.join(__dirname, '../packages/shared-types/src/api/index.ts');

async function generateTypes() {
  try {
    console.log(`📥 从 ${OPENAPI_URL} 获取 OpenAPI schema...`);
    
    // 确保输出目录存在
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 使用 openapi-typescript 生成类型
    execSync(
      `npx openapi-typescript "${OPENAPI_URL}" -o "${OUTPUT_PATH}"`,
      { stdio: 'inherit' }
    );
    
    // 添加文件头注释
    const header = `/**
 * 此文件由脚本自动生成，请勿手动修改
 * 生成时间: ${new Date().toISOString()}
 * 来源: ${OPENAPI_URL}
 * 
 * 使用方法:
 * import type { paths, components } from '@ai-education/shared-types/api';
 */

`;

    const content = fs.readFileSync(OUTPUT_PATH, 'utf-8');
    fs.writeFileSync(OUTPUT_PATH, header + content);
    
    console.log('✅ 类型生成成功！');
    console.log(`📁 输出路径: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('❌ 类型生成失败:', error);
    process.exit(1);
  }
}

generateTypes();

