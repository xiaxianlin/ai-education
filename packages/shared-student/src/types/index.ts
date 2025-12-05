/**
 * 共享类型定义
 * 
 * 包含：
 * 1. 核心业务模型类型（手动维护）
 * 2. API 类型（从 OpenAPI 自动生成）
 */

// 核心业务模型
export * from './models';

// API 类型（从 OpenAPI 生成）
// 运行 pnpm generate:types 后会生成实际的类型定义
// 目前暂时注释掉，生成后取消注释
// export type { paths, components } from './api';
