-- 添加 PracticePrompt 表的唯一性约束
-- 执行前请备份数据库

-- 1. 检查并删除可能存在的重复记录（保留 id 最小的记录）
DELETE t1 FROM ah_practice_prompt t1
INNER JOIN ah_practice_prompt t2 
WHERE t1.id > t2.id 
  AND t1.practice_type = t2.practice_type
  AND t1.subject = t2.subject
  AND t1.grade = t2.grade;

-- 2. 添加唯一性约束
ALTER TABLE ah_practice_prompt 
ADD UNIQUE KEY uk_practice_prompt (practice_type, subject, grade);

