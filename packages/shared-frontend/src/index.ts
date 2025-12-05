/**
 * Shared Frontend Package
 * 
 * 合并了 shared-types, shared-api-client, shared-utils 三个包
 * 
 * 导出内容：
 * 1. 类型定义 (types)
 * 2. API 客户端 (api-client)
 * 3. 工具函数 (utils)
 */

// 导出类型
export * from './types';

// 导出 API 客户端
export * from './api-client/client';
export * from './api-client/admin';
export * from './api-client/student';

// 导出实例以便直接使用
export { adminApi } from './api-client/admin';
export { studentApi } from './api-client/student';

// 导出工具函数
export * from './utils';

