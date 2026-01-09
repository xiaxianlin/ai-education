-- 题型表能力关联字段迁移脚本
-- 添加 domain_code 和 ability_atomic_codes 字段

-- 检查并添加 domain_code 字段
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_question_type'
    AND COLUMN_NAME = 'domain_code'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `ah_question_type`
     ADD COLUMN `domain_code` VARCHAR(50) NULL COMMENT ''关联的能力域代码（对应 AbilityDomain.code）'' AFTER `ability_dimensions`',
    'SELECT ''Column domain_code already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 ability_atomic_codes 字段
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_question_type'
    AND COLUMN_NAME = 'ability_atomic_codes'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `ah_question_type`
     ADD COLUMN `ability_atomic_codes` JSON NULL COMMENT ''关联的原子能力代码列表（对应 AbilityAtomic.code）'' AFTER `domain_code`',
    'SELECT ''Column ability_atomic_codes already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加索引
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_question_type'
    AND INDEX_NAME = 'ix_subject_domain'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX `ix_subject_domain` ON `ah_question_type`(`subject`, `domain_code`)',
    'SELECT ''Index ix_subject_domain already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
