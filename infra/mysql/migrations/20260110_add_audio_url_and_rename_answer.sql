-- ============================================================
-- 答题记录表结构升级脚本
-- 
-- 变更内容：
-- 1. 添加 audio_url 字段（VARCHAR(500)，用于存储音频答案URL）
-- 2. 将 text_answer 字段重命名为 answer（TEXT，存储 JSON 格式的答案）
-- 
-- 答案格式规范：
-- - 复合题: [{"sub_id": "1", "value": "答案1"}, {"sub_id": "2", "value": "答案2"}]
-- - 多选题: ["A", "B", "C"]
-- - 匹配题: {"A": "1", "B": "2"}
-- - 其他题型: 字符串，如 "A" 或 "答案内容"
-- 
-- 执行前请备份数据库！
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 步骤 1: 备份现有数据（可选，建议在生产环境执行）
-- ============================================================

-- CREATE TABLE ah_practice_answer_backup AS SELECT * FROM ah_practice_answer;

-- ============================================================
-- 步骤 2: 添加 audio_url 字段（在 text_answer 之后）
-- ============================================================

ALTER TABLE `ah_practice_answer` 
    ADD COLUMN `audio_url` VARCHAR(500) NULL COMMENT '音频答案URL' 
    AFTER `text_answer`;

-- ============================================================
-- 步骤 3: 重命名 text_answer 为 answer
-- ============================================================

ALTER TABLE `ah_practice_answer` 
    CHANGE COLUMN `text_answer` `answer` TEXT NULL COMMENT '学生答案（JSON格式）';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 验证脚本
-- ============================================================

-- 检查字段是否存在
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLUMN_COMMENT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
--   AND TABLE_NAME = 'ah_practice_answer' 
--   AND COLUMN_NAME IN ('answer', 'audio_url');
