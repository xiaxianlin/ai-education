-- 2025-05-30 PRD: textbook manual-entry migration.
--
-- Drop legacy textbook file upload, knowledge-base index, and parse-state fields.
-- This script is intentionally idempotent for partially migrated databases.

SET NAMES utf8mb4;
SET @schema_name = DATABASE();

SET @sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE `ah_textbook` DROP COLUMN `file`',
    'SELECT ''skip ah_textbook.file'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_textbook' AND COLUMN_NAME = 'file'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE `ah_textbook` DROP COLUMN `index_file_id`',
    'SELECT ''skip ah_textbook.index_file_id'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_textbook' AND COLUMN_NAME = 'index_file_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE `ah_textbook` DROP COLUMN `is_parsed`',
    'SELECT ''skip ah_textbook.is_parsed'''
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'ah_textbook' AND COLUMN_NAME = 'is_parsed'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
