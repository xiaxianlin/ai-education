-- 2025-05-30: migrate teacher managers into built-in system teachers and
-- attach legacy teacher-owned data to a built-in teacher.
--
-- Idempotent for local and deployed MySQL databases.

SET NAMES utf8mb4;
SET @schema_name = DATABASE();
SET @now = UNIX_TIMESTAMP();

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `ah_teacher` ADD COLUMN `is_system` int NOT NULL DEFAULT ''0'' COMMENT ''是否系统内置老师: 0-否 1-是'' AFTER `status`',
    'SELECT ''skip ah_teacher.is_system'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_teacher' AND COLUMN_NAME = 'is_system'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX `ix_ah_teacher_is_system` ON `ah_teacher` (`is_system`)',
    'SELECT ''skip ix_ah_teacher_is_system'''
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_teacher' AND INDEX_NAME = 'ix_ah_teacher_is_system'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO `ah_teacher` (
  `id`,
  `account`,
  `password`,
  `name`,
  `phone`,
  `subject`,
  `school`,
  `status`,
  `is_system`,
  `create_time`,
  `update_time`
)
SELECT
  manager.`id`,
  manager.`username`,
  manager.`password`,
  manager.`username`,
  CONCAT('system-', LEFT(REPLACE(manager.`id`, '-', ''), 24)),
  '系统',
  '系统内置',
  COALESCE(manager.`status`, 1),
  1,
  COALESCE(manager.`create_time`, @now),
  COALESCE(manager.`update_time`, @now)
FROM `ah_manager` AS manager
WHERE manager.`type` = 2
ON DUPLICATE KEY UPDATE
  `password` = VALUES(`password`),
  `name` = IF(`name` IS NULL OR `name` = '', VALUES(`name`), `name`),
  `phone` = IF(`phone` IS NULL OR `phone` = '', VALUES(`phone`), `phone`),
  `subject` = IF(`subject` IS NULL OR `subject` = '', VALUES(`subject`), `subject`),
  `school` = IF(`school` IS NULL OR `school` = '', VALUES(`school`), `school`),
  `status` = VALUES(`status`),
  `is_system` = 1,
  `update_time` = VALUES(`update_time`);

INSERT INTO `ah_teacher` (
  `id`,
  `account`,
  `password`,
  `name`,
  `phone`,
  `subject`,
  `school`,
  `status`,
  `is_system`,
  `create_time`,
  `update_time`
)
SELECT
  'system-teacher',
  'system_teacher',
  manager.`password`,
  '系统内置老师',
  'system-teacher',
  '系统',
  '系统内置',
  1,
  1,
  @now,
  @now
FROM `ah_manager` AS manager
WHERE NOT EXISTS (SELECT 1 FROM `ah_teacher` WHERE `is_system` = 1)
ORDER BY manager.`type`, manager.`create_time`, manager.`id`
LIMIT 1
ON DUPLICATE KEY UPDATE
  `is_system` = 1,
  `status` = 1,
  `update_time` = VALUES(`update_time`);

SET @system_teacher_id = (
  SELECT `id`
  FROM `ah_teacher`
  WHERE `is_system` = 1
  ORDER BY
    CASE WHEN `id` = 'system-teacher' THEN 1 ELSE 0 END,
    `create_time`,
    `id`
  LIMIT 1
);

UPDATE `ah_student`
SET `teacher_id` = @system_teacher_id,
    `update_time` = @now
WHERE @system_teacher_id IS NOT NULL
  AND (
    `teacher_id` IS NULL
    OR `teacher_id` = ''
    OR `teacher_id` NOT IN (SELECT `id` FROM `ah_teacher`)
  );

UPDATE `ah_textbook`
SET `teacher_id` = @system_teacher_id
WHERE @system_teacher_id IS NOT NULL
  AND (
    `teacher_id` IS NULL
    OR `teacher_id` = ''
    OR `teacher_id` NOT IN (SELECT `id` FROM `ah_teacher`)
  );

UPDATE `ah_ability`
SET `teacher_id` = @system_teacher_id
WHERE @system_teacher_id IS NOT NULL
  AND (
    `teacher_id` IS NULL
    OR `teacher_id` = ''
    OR `teacher_id` NOT IN (SELECT `id` FROM `ah_teacher`)
  );

UPDATE `ah_question`
SET `teacher_id` = @system_teacher_id
WHERE @system_teacher_id IS NOT NULL
  AND (
    `teacher_id` IS NULL
    OR `teacher_id` = ''
    OR `teacher_id` NOT IN (SELECT `id` FROM `ah_teacher`)
  );

UPDATE `ah_question_type`
SET `teacher_id` = @system_teacher_id
WHERE @system_teacher_id IS NOT NULL
  AND (
    `teacher_id` IS NULL
    OR `teacher_id` = ''
    OR `teacher_id` NOT IN (SELECT `id` FROM `ah_teacher`)
  );

SELECT @system_teacher_id AS system_teacher_id;
