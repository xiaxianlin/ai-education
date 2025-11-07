-- 数据库迁移脚本：更新学生配置表结构（简化版本）
-- 创建时间: 2025-01-XX
-- 说明: 删除 grade、textbook_version、semester 字段，添加 current_textbook_id 字段
-- 注意: 如果字段不存在会报错，请先检查表结构

-- 删除不再需要的字段
ALTER TABLE ah_student_profile DROP COLUMN grade;
ALTER TABLE ah_student_profile DROP COLUMN textbook_version;
ALTER TABLE ah_student_profile DROP COLUMN semester;

-- 添加当前学习教材ID字段
ALTER TABLE ah_student_profile ADD COLUMN current_textbook_id INT NULL COMMENT '当前学习教材ID';

