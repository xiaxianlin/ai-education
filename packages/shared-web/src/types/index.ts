/**
 * 统一类型导出
 * 所有类型都可以从这里导入，也可以全局使用（通过 global.d.ts）
 */

// 通用类型
export * from './common';

// 管理端类型
export * from './admin';

// 教材相关类型
export * from './textbook';

// 题目相关类型
export * from './question';

// 学生相关类型
export * from './student';

// 练习相关类型
export * from './practice';

// 服务相关类型
export * from './service';

// 向后兼容导出
export * from './api';
export * from './schema';

// 导入全局类型声明（使类型全局可用）
import './global';

