-- ============================================================
-- AI Education Platform - 数据库初始化脚本
-- 说明: 此脚本在数据库首次创建时自动执行
-- ============================================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 创建数据库(如果不存在)
CREATE DATABASE IF NOT EXISTS `ai_helper`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `ai_helper`;

-- ============================================================
-- 基础配置
-- ============================================================

-- 设置时区
SET time_zone = '+08:00';

-- ============================================================
-- 示例: 如需预创建表结构，可在此添加
-- ============================================================

-- 示例: 系统配置表
-- CREATE TABLE IF NOT EXISTS `sys_config` (
--     `id` INT AUTO_INCREMENT PRIMARY KEY,
--     `config_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
--     `config_value` TEXT COMMENT '配置值',
--     `description` VARCHAR(255) COMMENT '描述',
--     `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     INDEX idx_config_key (`config_key`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ============================================================
-- 完成初始化
-- ============================================================

SELECT 'Database initialization completed!' as Status;
