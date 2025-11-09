-- 为 ah_question 表添加 needs_image 和 needs_audio 字段
-- 用于标记题目是否需要生成图片或语音

ALTER TABLE ah_question 
ADD COLUMN needs_image INT DEFAULT 0 COMMENT '是否需要生成图片：0-否，1-是' AFTER resource,
ADD COLUMN needs_audio INT DEFAULT 0 COMMENT '是否需要生成语音：0-否，1-是' AFTER needs_image;

-- 为字段添加索引（可选，如果需要按标识查询）
-- CREATE INDEX idx_question_needs_image ON ah_question(needs_image);
-- CREATE INDEX idx_question_needs_audio ON ah_question(needs_audio);

