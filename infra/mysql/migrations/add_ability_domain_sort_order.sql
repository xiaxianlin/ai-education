-- 为能力域表添加 sort_order 字段
-- 执行时间: 2025-01-XX

ALTER TABLE `ah_ability_domain` 
ADD COLUMN `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序' AFTER `is_active`;

-- 为现有数据设置初始排序值（使用 id 作为初始值）
UPDATE `ah_ability_domain` 
SET `sort_order` = `id` 
WHERE `sort_order` = 0;
