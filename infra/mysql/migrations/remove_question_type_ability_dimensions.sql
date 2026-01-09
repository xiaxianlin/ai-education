-- 删除题型表的 ability_dimensions 字段
-- 该字段已迁移到 domain_code 和 ability_atomic_codes

-- 检查字段是否存在
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_question_type'
    AND COLUMN_NAME = 'ability_dimensions'
);

-- 如果字段存在则删除
SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `ah_question_type` DROP COLUMN `ability_dimensions`',
    'SELECT ''Column ability_dimensions does not exist, skipping'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
