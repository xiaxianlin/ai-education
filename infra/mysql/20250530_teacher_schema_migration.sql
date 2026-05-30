-- 2025-05-30 PRD: teacher ownership and textbook units migration.
--
-- This script is intentionally idempotent for partially migrated databases.
-- Phase 2 removes legacy tables after units are migrated into ah_textbook.units.

SET NAMES utf8mb4;
SET @schema_name = DATABASE();

CREATE TABLE IF NOT EXISTS `ah_teacher` (
  `id` varchar(255) NOT NULL COMMENT '教师ID',
  `account` varchar(255) NOT NULL COMMENT '账号',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `name` varchar(255) NOT NULL COMMENT '姓名',
  `phone` varchar(255) DEFAULT NULL COMMENT '手机号',
  `subject` varchar(255) DEFAULT NULL COMMENT '学科',
  `school` varchar(255) DEFAULT NULL COMMENT '学校',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态: 0-禁用 1-启用',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ah_teacher_account` (`account`),
  KEY `ix_ah_teacher_phone` (`phone`),
  KEY `ix_ah_teacher_status` (`status`),
  KEY `ix_ah_teacher_subject` (`subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='教师表';

CREATE TABLE IF NOT EXISTS `ah_student_teacher_claim` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '认领申请ID',
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `teacher_id` varchar(255) NOT NULL COMMENT '教师ID',
  `status` varchar(32) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/approved/rejected',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `ix_ah_student_teacher_claim_student_id` (`student_id`),
  KEY `ix_ah_student_teacher_claim_teacher_id` (`teacher_id`),
  KEY `ix_ah_student_teacher_claim_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='学生教师认领申请表';

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `ah_student` ADD COLUMN `semester` varchar(255) DEFAULT NULL COMMENT ''当前学期'' AFTER `grade`',
    'SELECT ''skip ah_student.semester'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_student' AND COLUMN_NAME = 'semester'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `ah_student` ADD COLUMN `subject` varchar(255) DEFAULT NULL COMMENT ''当前学科'' AFTER `semester`',
    'SELECT ''skip ah_student.subject'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_student' AND COLUMN_NAME = 'subject'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `ah_student` ADD COLUMN `teacher_id` varchar(255) DEFAULT NULL COMMENT ''关联教师ID'' AFTER `subject`',
    'SELECT ''skip ah_student.teacher_id'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_student' AND COLUMN_NAME = 'teacher_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `ah_textbook` ADD COLUMN `teacher_id` varchar(255) DEFAULT NULL COMMENT ''关联教师ID'' AFTER `id`',
    'SELECT ''skip ah_textbook.teacher_id'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_textbook' AND COLUMN_NAME = 'teacher_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `ah_textbook` ADD COLUMN `units` json DEFAULT NULL COMMENT ''教材单元信息'' AFTER `is_parsed`',
    'SELECT ''skip ah_textbook.units'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_textbook' AND COLUMN_NAME = 'units'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `ah_ability` ADD COLUMN `teacher_id` varchar(255) DEFAULT NULL COMMENT ''关联教师ID'' AFTER `id`',
    'SELECT ''skip ah_ability.teacher_id'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_ability' AND COLUMN_NAME = 'teacher_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `ah_question` ADD COLUMN `teacher_id` varchar(255) DEFAULT NULL COMMENT ''关联教师ID'' AFTER `id`',
    'SELECT ''skip ah_question.teacher_id'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_question' AND COLUMN_NAME = 'teacher_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `ah_question_type` ADD COLUMN `teacher_id` varchar(255) DEFAULT NULL COMMENT ''关联教师ID'' AFTER `id`',
    'SELECT ''skip ah_question_type.teacher_id'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_question_type' AND COLUMN_NAME = 'teacher_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX `ix_ah_student_teacher_id` ON `ah_student` (`teacher_id`)',
    'SELECT ''skip ix_ah_student_teacher_id'''
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_student' AND INDEX_NAME = 'ix_ah_student_teacher_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX `ix_ah_textbook_teacher_id` ON `ah_textbook` (`teacher_id`)',
    'SELECT ''skip ix_ah_textbook_teacher_id'''
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_textbook' AND INDEX_NAME = 'ix_ah_textbook_teacher_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX `ix_ah_ability_teacher_id` ON `ah_ability` (`teacher_id`)',
    'SELECT ''skip ix_ah_ability_teacher_id'''
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_ability' AND INDEX_NAME = 'ix_ah_ability_teacher_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX `ix_ah_question_teacher_id` ON `ah_question` (`teacher_id`)',
    'SELECT ''skip ix_ah_question_teacher_id'''
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_question' AND INDEX_NAME = 'ix_ah_question_teacher_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX `ix_ah_question_type_teacher_id` ON `ah_question_type` (`teacher_id`)',
    'SELECT ''skip ix_ah_question_type_teacher_id'''
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_question_type' AND INDEX_NAME = 'ix_ah_question_type_teacher_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrate ah_unit rows into ah_textbook.units.
-- Unit array shape: [{ "id": 1, "sort_order": 1, "name": "...", "content": "..." }]
SET SESSION group_concat_max_len = 1048576;

UPDATE `ah_textbook` AS textbook
LEFT JOIN (
  SELECT
    ordered_unit.`textbook_id`,
    CONCAT(
      '[',
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', ordered_unit.`id`,
          'sort_order', ordered_unit.`sort_order`,
          'name', ordered_unit.`name`,
          'content', ordered_unit.`content`
        )
        ORDER BY ordered_unit.`id`
        SEPARATOR ','
      ),
      ']'
    ) AS `units_json`
  FROM (
    SELECT
      `id`,
      `textbook_id`,
      `name`,
      `content`,
      ROW_NUMBER() OVER (PARTITION BY `textbook_id` ORDER BY `id`) AS `sort_order`
    FROM `ah_unit`
  ) AS ordered_unit
  GROUP BY ordered_unit.`textbook_id`
) AS unit_group ON unit_group.`textbook_id` = textbook.`id`
SET textbook.`units` = IFNULL(unit_group.`units_json`, JSON_ARRAY())
WHERE textbook.`units` IS NULL OR JSON_LENGTH(textbook.`units`) = 0;

-- Optional verification queries:
-- SELECT COUNT(*) AS textbook_without_units FROM ah_textbook WHERE units IS NULL;
-- SELECT id, subject, grade, semester, JSON_LENGTH(units) AS unit_count FROM ah_textbook ORDER BY id;

-- Phase 2 cleanup after all application code has stopped reading these tables.
DROP TABLE IF EXISTS `ah_student_textbook_config`;
DROP TABLE IF EXISTS `ah_teacher_book`;
DROP TABLE IF EXISTS `ah_unit`;
DROP TABLE IF EXISTS `ah_textbook_version`;
