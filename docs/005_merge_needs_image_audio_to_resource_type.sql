-- 将 needs_image 和 needs_audio 字段合并为 resource_type 字段
-- resource_type 的值：'image'（需要图片）、'audio'（需要语音）、NULL（无资源）

-- 1. 添加新字段 resource_type
ALTER TABLE ah_question 
ADD COLUMN resource_type VARCHAR(50) NULL COMMENT '资源类型：image-图片，audio-语音，空-无资源' AFTER resource;

-- 2. 迁移现有数据
-- 将 needs_image=1 的记录设置为 resource_type='image'
UPDATE ah_question 
SET resource_type = 'image' 
WHERE needs_image = 1;

-- 将 needs_audio=1 的记录设置为 resource_type='audio'
-- 注意：如果同时需要图片和语音，优先设置为 'image'（可以根据业务需求调整）
UPDATE ah_question 
SET resource_type = 'audio' 
WHERE needs_audio = 1 AND (needs_image = 0 OR needs_image IS NULL);

-- 3. 删除旧字段
ALTER TABLE ah_question 
DROP COLUMN needs_image,
DROP COLUMN needs_audio;

