-- 练习会话表字段迁移脚本
-- 添加 subject, grade, ability_codes, unit_id 字段，删除 parameters 字段

-- 检查并添加 subject 字段
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_session'
    AND COLUMN_NAME = 'subject'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `ah_practice_session`
     ADD COLUMN `subject` VARCHAR(50) NULL COMMENT ''科目'' AFTER `practice_type`',
    'SELECT ''Column subject already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 grade 字段
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_session'
    AND COLUMN_NAME = 'grade'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `ah_practice_session`
     ADD COLUMN `grade` INT NULL COMMENT ''年级'' AFTER `subject`',
    'SELECT ''Column grade already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 ability_codes 字段
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_session'
    AND COLUMN_NAME = 'ability_codes'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `ah_practice_session`
     ADD COLUMN `ability_codes` JSON NULL COMMENT ''原子能力代码列表（JSON数组）'' AFTER `grade`',
    'SELECT ''Column ability_codes already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 unit_id 字段
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_session'
    AND COLUMN_NAME = 'unit_id'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `ah_practice_session`
     ADD COLUMN `unit_id` INT NULL COMMENT ''单元ID'' AFTER `ability_codes`',
    'SELECT ''Column unit_id already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 subject 索引
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_session'
    AND INDEX_NAME = 'ix_subject'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX `ix_subject` ON `ah_practice_session`(`subject`)',
    'SELECT ''Index ix_subject already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 grade 索引
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_session'
    AND INDEX_NAME = 'ix_grade'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX `ix_grade` ON `ah_practice_session`(`grade`)',
    'SELECT ''Index ix_grade already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 unit_id 索引
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_session'
    AND INDEX_NAME = 'ix_unit_id'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX `ix_unit_id` ON `ah_practice_session`(`unit_id`)',
    'SELECT ''Index ix_unit_id already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并删除 parameters 字段
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_practice_session'
    AND COLUMN_NAME = 'parameters'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `ah_practice_session` DROP COLUMN `parameters`',
    'SELECT ''Column parameters does not exist'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
