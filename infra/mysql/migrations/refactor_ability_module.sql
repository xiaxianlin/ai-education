-- 能力模块重构：移除能力域，统一为能力概念，移除排序功能
-- 执行时间：请根据实际情况填写

-- 1. 备份数据（可选，建议在生产环境执行）
-- CREATE TABLE ah_ability_atomic_backup AS SELECT * FROM ah_ability_atomic;
-- CREATE TABLE ah_ability_domain_backup AS SELECT * FROM ah_ability_domain;

-- 2. 清空现有数据（根据用户选择：clean-start 策略）
-- 注意：如果学生能力掌握度表有数据，需要先处理关联关系
-- 方案A：清空学生能力掌握度表（如果允许）
-- TRUNCATE TABLE ah_student_ability_mastery;
-- 方案B：保留学生能力掌握度数据，但需要后续手动清理无效的 ability_code

-- 3. 删除学生能力掌握度表的外键约束（如果有）
-- ALTER TABLE ah_student_ability_mastery DROP FOREIGN KEY IF EXISTS fk_ability_code;

-- 4. 清空原子能力表数据
TRUNCATE TABLE ah_ability_atomic;

-- 5. 移除原子能力表的 domain_code 字段
ALTER TABLE ah_ability_atomic DROP COLUMN domain_code;

-- 6. 移除原子能力表的 sort_order 字段
ALTER TABLE ah_ability_atomic DROP COLUMN sort_order;

-- 7. 重命名表：ah_ability_atomic → ah_ability
RENAME TABLE ah_ability_atomic TO ah_ability;

-- 8. 更新表注释
ALTER TABLE ah_ability COMMENT = '能力表';

-- 9. 移除题目表的 domain_code 字段
ALTER TABLE ah_question_type DROP COLUMN domain_code;
ALTER TABLE ah_question_type DROP INDEX IF EXISTS ix_subject_domain;

-- 10. 删除能力域表
DROP TABLE IF EXISTS ah_ability_domain;
