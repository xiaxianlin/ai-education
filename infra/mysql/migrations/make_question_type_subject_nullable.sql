-- 题型模型科目字段可选化
-- 将 ah_question_type.subject 字段从 NOT NULL 改为允许 NULL
-- 执行时间：请根据实际情况填写

-- 修改 subject 字段为允许 NULL
ALTER TABLE ah_question_type MODIFY COLUMN subject VARCHAR(50) NULL COMMENT '科目';
