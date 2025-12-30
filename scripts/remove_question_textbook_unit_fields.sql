-- 删除 Question 表中的 textbook_id 和 unit_id 字段
-- 执行时间: 2024

-- 1. 删除相关索引（如果存在）
DROP INDEX IF EXISTS `idx_textbook_unit` ON `ah_question`;
DROP INDEX IF EXISTS `idx_textbook_id` ON `ah_question`;
DROP INDEX IF EXISTS `idx_unit_id` ON `ah_question`;

-- 2. 删除列
ALTER TABLE `ah_question` 
  DROP COLUMN IF EXISTS `textbook_id`,
  DROP COLUMN IF EXISTS `unit_id`;

