-- 数据库迁移脚本：更新学生配置表结构
-- 创建时间: 2025-01-XX
-- 说明: 删除 grade、textbook_version、semester 字段，添加 current_textbook_id 字段

-- 1. 删除不再需要的字段（如果存在）
ALTER TABLE ah_student_profile 
DROP COLUMN IF EXISTS grade,
DROP COLUMN IF EXISTS textbook_version,
DROP COLUMN IF EXISTS semester;

-- 2. 添加当前学习教材ID字段（如果不存在）
ALTER TABLE ah_student_profile 
ADD COLUMN IF NOT EXISTS current_textbook_id INT NULL COMMENT '当前学习教材ID';

-- 注意：MySQL 5.7 及以下版本不支持 IF EXISTS/IF NOT EXISTS
-- 如果遇到错误，请使用以下语句（需要手动检查字段是否存在）：

-- 删除字段（如果存在，需要先检查）
-- ALTER TABLE ah_student_profile DROP COLUMN grade;
-- ALTER TABLE ah_student_profile DROP COLUMN textbook_version;
-- ALTER TABLE ah_student_profile DROP COLUMN semester;

-- 添加字段（如果不存在，需要先检查）
-- ALTER TABLE ah_student_profile ADD COLUMN current_textbook_id INT NULL COMMENT '当前学习教材ID';

