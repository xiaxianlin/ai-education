-- 学生表设置字段迁移脚本
-- 添加 semester 和 subject 字段

-- 检查并添加 semester 字段
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_student'
    AND COLUMN_NAME = 'semester'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `ah_student`
     ADD COLUMN `semester` VARCHAR(255) NULL COMMENT ''当前学期'' AFTER `grade`',
    'SELECT ''Column semester already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 subject 字段
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ah_student'
    AND COLUMN_NAME = 'subject'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `ah_student`
     ADD COLUMN `subject` VARCHAR(255) NULL COMMENT ''当前学科'' AFTER `semester`',
    'SELECT ''Column subject already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
