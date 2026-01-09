-- 学生表设置字段迁移脚本（Navicat 版本）
-- 可以直接在 Navicat 中执行
-- 注意：如果字段已存在会报错，可以忽略错误或先手动检查

-- 添加 semester 字段
ALTER TABLE `ah_student`
ADD COLUMN `semester` VARCHAR(255) NULL COMMENT '当前学期' AFTER `grade`;

-- 添加 subject 字段
ALTER TABLE `ah_student`
ADD COLUMN `subject` VARCHAR(255) NULL COMMENT '当前学科' AFTER `semester`;
