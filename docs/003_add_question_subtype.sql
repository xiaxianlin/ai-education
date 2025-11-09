-- 为 ah_question 表添加 subtype 字段
-- 用于存储题目的子类型（如"看图选词"、"听音写单词"等）

ALTER TABLE ah_question 
ADD COLUMN subtype VARCHAR(255) COMMENT '题目子类型' AFTER type;

-- 为 subtype 字段添加索引（可选，如果需要按子类型查询）
-- CREATE INDEX idx_question_subtype ON ah_question(subtype);

