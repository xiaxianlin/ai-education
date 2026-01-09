-- ============================================================
-- 重命名 PracticeSession 相关表为 Practice
-- 
-- 变更内容：
-- 1. ah_practice_session → ah_practice
-- 2. ah_practice_session_answer → ah_practice_answer
-- 3. ah_practice_session_report → ah_practice_report
-- 4. 更新相关索引名称
-- 
-- 执行前请备份数据库！
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 步骤 1: 重命名主表 ah_practice_session → ah_practice
-- ============================================================

RENAME TABLE `ah_practice_session` TO `ah_practice`;

-- ============================================================
-- 步骤 2: 重命名答题记录表 ah_practice_session_answer → ah_practice_answer
-- ============================================================

RENAME TABLE `ah_practice_session_answer` TO `ah_practice_answer`;

-- ============================================================
-- 步骤 3: 重命名报告表 ah_practice_session_report → ah_practice_report
-- ============================================================

RENAME TABLE `ah_practice_session_report` TO `ah_practice_report`;

-- ============================================================
-- 步骤 4: 更新索引名称（如果需要）
-- ============================================================

-- 注意：MySQL 的 RENAME TABLE 会自动更新索引名称中的表名部分
-- 但为了确保一致性，我们显式检查并重命名索引

-- 检查并重命名 ah_practice 表的索引
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice'
    AND INDEX_NAME = 'ix_ah_practice_session_status'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `ah_practice` RENAME INDEX `ix_ah_practice_session_status` TO `ix_ah_practice_status`',
    'SELECT ''Index already renamed or does not exist'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice'
    AND INDEX_NAME = 'ix_ah_practice_session_student_id'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `ah_practice` RENAME INDEX `ix_ah_practice_session_student_id` TO `ix_ah_practice_student_id`',
    'SELECT ''Index already renamed or does not exist'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice'
    AND INDEX_NAME = 'ix_ah_practice_session_generate_status'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `ah_practice` RENAME INDEX `ix_ah_practice_session_generate_status` TO `ix_ah_practice_generate_status`',
    'SELECT ''Index already renamed or does not exist'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并重命名 ah_practice_answer 表的索引
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_answer'
    AND INDEX_NAME = 'ix_ah_practice_session_answer_session_id'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `ah_practice_answer` RENAME INDEX `ix_ah_practice_session_answer_session_id` TO `ix_ah_practice_answer_session_id`',
    'SELECT ''Index already renamed or does not exist'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_answer'
    AND INDEX_NAME = 'ix_ah_practice_session_answer_student_id'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `ah_practice_answer` RENAME INDEX `ix_ah_practice_session_answer_student_id` TO `ix_ah_practice_answer_student_id`',
    'SELECT ''Index already renamed or does not exist'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_answer'
    AND INDEX_NAME = 'ix_ah_practice_session_answer_unit_id'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `ah_practice_answer` RENAME INDEX `ix_ah_practice_session_answer_unit_id` TO `ix_ah_practice_answer_unit_id`',
    'SELECT ''Index already renamed or does not exist'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_answer'
    AND INDEX_NAME = 'ix_ah_practice_session_answer_textbook_id'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `ah_practice_answer` RENAME INDEX `ix_ah_practice_session_answer_textbook_id` TO `ix_ah_practice_answer_textbook_id`',
    'SELECT ''Index already renamed or does not exist'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_answer'
    AND INDEX_NAME = 'ix_ah_practice_session_answer_question_id'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `ah_practice_answer` RENAME INDEX `ix_ah_practice_session_answer_question_id` TO `ix_ah_practice_answer_question_id`',
    'SELECT ''Index already renamed or does not exist'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并重命名 ah_practice_report 表的唯一索引
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_report'
    AND INDEX_NAME = 'ix_ah_practice_session_report_session_id'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `ah_practice_report` RENAME INDEX `ix_ah_practice_session_report_session_id` TO `ix_ah_practice_report_session_id`',
    'SELECT ''Index already renamed or does not exist'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 迁移完成
-- ============================================================
