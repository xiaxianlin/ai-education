-- 删除题目表的 ability_code 字段
-- 执行时间：请根据实际情况填写

-- 删除 ability_code 字段及其索引
ALTER TABLE ah_question DROP INDEX IF EXISTS ix_ah_question_ability_code;
ALTER TABLE ah_question DROP COLUMN ability_code;
