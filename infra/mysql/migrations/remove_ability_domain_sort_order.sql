-- 移除能力域表的 sort_order 字段
-- 执行时间: 2025-01-XX

ALTER TABLE ah_ability_domain DROP COLUMN sort_order;
