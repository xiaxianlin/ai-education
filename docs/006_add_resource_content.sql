-- 为 ah_question 表添加 resource_content 字段
-- 用于存储录音文本等资源内容

ALTER TABLE ah_question 
ADD COLUMN resource_content TEXT NULL COMMENT '资源内容（录音文本等）' AFTER resource_type;

