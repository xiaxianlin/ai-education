-- 更新难度等级：从"简单"、"轻松"、"中等"、"较难"、"困难"变更为"简单"、"普通"、"困难"
-- 注意：此脚本仅更新数据库中的难度值，如果数据库中有旧值，需要手动迁移

-- 1. 更新题目表中的难度值（将旧值映射到新值）
-- "轻松" -> "简单"
UPDATE ah_question SET difficulty = '简单' WHERE difficulty = '轻松';

-- "中等" -> "普通"
UPDATE ah_question SET difficulty = '普通' WHERE difficulty = '中等';

-- "较难" -> "困难"
UPDATE ah_question SET difficulty = '困难' WHERE difficulty = '较难';

-- 2. 更新学生偏好表中的难度偏好（将旧值映射到新值）
-- "中等" -> "普通"
UPDATE ah_student_profile SET difficulty_preference = '普通' WHERE difficulty_preference = '中等';

-- 注意：如果数据库中有其他旧值（如"轻松"、"较难"），也需要相应更新
-- 可以根据实际情况调整映射关系

