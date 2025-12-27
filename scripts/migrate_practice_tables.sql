-- ============================================================
-- Practice 和 PracticePrompt 表重构迁移脚本
-- 执行方式: mysql -u root -p ai_education < scripts/migrate_practice_tables.sql
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 辅助存储过程：安全添加列
-- ============================================================
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

DELIMITER //
CREATE PROCEDURE add_column_if_not_exists(
    IN p_table VARCHAR(64),
    IN p_column VARCHAR(64),
    IN p_definition VARCHAR(500)
)
BEGIN
    SET @sql = CONCAT(
        'SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS ',
        'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ''', p_table, ''' AND COLUMN_NAME = ''', p_column, ''''
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    IF @col_exists = 0 THEN
        SET @alter_sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
        PREPARE alter_stmt FROM @alter_sql;
        EXECUTE alter_stmt;
        DEALLOCATE PREPARE alter_stmt;
        SELECT CONCAT('Added column: ', p_table, '.', p_column) AS result;
    ELSE
        SELECT CONCAT('Column already exists: ', p_table, '.', p_column) AS result;
    END IF;
END //
DELIMITER ;


-- ============================================================
-- 1. 修改 ah_practice 表，添加新字段
-- ============================================================

-- 场景类型字段
CALL add_column_if_not_exists('ah_practice', 'scene_type', 'varchar(50) DEFAULT NULL COMMENT ''场景类型：daily_training/unit_test/comprehensive_assessment''');

-- 适用范围字段
CALL add_column_if_not_exists('ah_practice', 'subject', 'varchar(50) DEFAULT NULL COMMENT ''科目''');
CALL add_column_if_not_exists('ah_practice', 'stages', 'json DEFAULT NULL COMMENT ''适用学段列表''');
CALL add_column_if_not_exists('ah_practice', 'grades', 'json DEFAULT NULL COMMENT ''适用年级列表''');

-- 配置字段
CALL add_column_if_not_exists('ah_practice', 'question_count_config', 'json DEFAULT NULL COMMENT ''题量配置''');
CALL add_column_if_not_exists('ah_practice', 'difficulty_config', 'json DEFAULT NULL COMMENT ''难度配置''');
CALL add_column_if_not_exists('ah_practice', 'ability_config', 'json DEFAULT NULL COMMENT ''能力维度配置''');
CALL add_column_if_not_exists('ah_practice', 'feedback_config', 'json DEFAULT NULL COMMENT ''反馈配置''');

-- 元数据字段
CALL add_column_if_not_exists('ah_practice', 'sort_order', 'int DEFAULT 0 COMMENT ''排序''');
CALL add_column_if_not_exists('ah_practice', 'is_active', 'tinyint(1) DEFAULT 1 COMMENT ''是否启用''');


-- ============================================================
-- 2. 修改 ah_practice_prompt 表，添加新字段
-- ============================================================

-- 基础信息字段
CALL add_column_if_not_exists('ah_practice_prompt', 'name', 'varchar(100) DEFAULT NULL COMMENT ''配置名称''');
CALL add_column_if_not_exists('ah_practice_prompt', 'code', 'varchar(100) DEFAULT NULL COMMENT ''配置编码''');
CALL add_column_if_not_exists('ah_practice_prompt', 'description', 'text DEFAULT NULL COMMENT ''配置描述''');

-- 场景分类字段
CALL add_column_if_not_exists('ah_practice_prompt', 'scene_type', 'varchar(50) DEFAULT NULL COMMENT ''场景类型''');
CALL add_column_if_not_exists('ah_practice_prompt', 'specialty_type', 'varchar(50) DEFAULT NULL COMMENT ''专项类型''');

-- 适用范围字段
CALL add_column_if_not_exists('ah_practice_prompt', 'stages', 'json DEFAULT NULL COMMENT ''适用学段列表''');
CALL add_column_if_not_exists('ah_practice_prompt', 'grades', 'json DEFAULT NULL COMMENT ''适用年级列表''');
CALL add_column_if_not_exists('ah_practice_prompt', 'semesters', 'json DEFAULT NULL COMMENT ''适用学期列表''');

-- ID 关联字段
CALL add_column_if_not_exists('ah_practice_prompt', 'practice_id', 'int DEFAULT NULL COMMENT ''关联练习ID''');
CALL add_column_if_not_exists('ah_practice_prompt', 'prompt_id', 'int DEFAULT NULL COMMENT ''关联提示词ID''');

-- 配置字段
CALL add_column_if_not_exists('ah_practice_prompt', 'question_type_configs', 'json DEFAULT NULL COMMENT ''题型组合配置''');
CALL add_column_if_not_exists('ah_practice_prompt', 'difficulty_config', 'json DEFAULT NULL COMMENT ''难度配置''');
CALL add_column_if_not_exists('ah_practice_prompt', 'question_count_config', 'json DEFAULT NULL COMMENT ''题量配置''');
CALL add_column_if_not_exists('ah_practice_prompt', 'template_variables', 'json DEFAULT NULL COMMENT ''模板变量定义''');

-- 元数据字段
CALL add_column_if_not_exists('ah_practice_prompt', 'sort_order', 'int DEFAULT 0 COMMENT ''排序''');
CALL add_column_if_not_exists('ah_practice_prompt', 'is_active', 'tinyint(1) DEFAULT 1 COMMENT ''是否启用''');


-- ============================================================
-- 3. 添加索引（忽略已存在错误）
-- ============================================================

-- ah_practice 索引
SET @sql = 'CREATE INDEX idx_scene_type ON ah_practice(scene_type)';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'CREATE INDEX idx_subject ON ah_practice(subject)';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'CREATE INDEX idx_is_active ON ah_practice(is_active)';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ah_practice_prompt 索引
SET @sql = 'CREATE INDEX idx_pp_code ON ah_practice_prompt(code)';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'CREATE INDEX idx_pp_scene_type ON ah_practice_prompt(scene_type)';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'CREATE INDEX idx_pp_specialty_type ON ah_practice_prompt(specialty_type)';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'CREATE INDEX idx_pp_practice_id ON ah_practice_prompt(practice_id)';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'CREATE INDEX idx_pp_prompt_id ON ah_practice_prompt(prompt_id)';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'CREATE INDEX idx_pp_is_active ON ah_practice_prompt(is_active)';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ============================================================
-- 4. 数据迁移：将 grade 迁移到 grades
-- ============================================================

-- 将现有 grade 字段值迁移到 grades JSON 数组
UPDATE `ah_practice_prompt` 
SET `grades` = JSON_ARRAY(`grade`) 
WHERE `grade` IS NOT NULL AND `grades` IS NULL;

-- 设置默认的 stages 值（基于 grade）
UPDATE `ah_practice_prompt` 
SET `stages` = JSON_ARRAY('primary_low') 
WHERE `grade` IN (1, 2, 3) AND `stages` IS NULL;

UPDATE `ah_practice_prompt` 
SET `stages` = JSON_ARRAY('primary_high') 
WHERE `grade` IN (4, 5, 6) AND `stages` IS NULL;

UPDATE `ah_practice_prompt` 
SET `stages` = JSON_ARRAY('junior') 
WHERE `grade` IN (7, 8, 9) AND `stages` IS NULL;

UPDATE `ah_practice_prompt` 
SET `stages` = JSON_ARRAY('senior') 
WHERE `grade` IN (10, 11, 12) AND `stages` IS NULL;

-- 填充 practice_id（基于 practice_slug）
UPDATE `ah_practice_prompt` pp
INNER JOIN `ah_practice` p ON pp.practice_slug = p.slug
SET pp.practice_id = p.id
WHERE pp.practice_id IS NULL AND pp.practice_slug IS NOT NULL;

-- 填充 prompt_id（基于 prompt_slug）
UPDATE `ah_practice_prompt` pp
INNER JOIN `ah_prompt` pr ON pp.prompt_slug = pr.slug
SET pp.prompt_id = pr.id
WHERE pp.prompt_id IS NULL AND pp.prompt_slug IS NOT NULL;


-- ============================================================
-- 清理临时存储过程
-- ============================================================
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 执行完成提示
-- ============================================================
SELECT 'Practice tables migration completed!' AS result;

-- 显示 ah_practice 表结构
DESCRIBE `ah_practice`;

-- 显示 ah_practice_prompt 表结构
DESCRIBE `ah_practice_prompt`;
