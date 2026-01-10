-- 学生科目版本关联迁移脚本
-- 创建 ah_student_subject_version 表，删除 ah_student_textbook 表

-- 1. 创建新表 ah_student_subject_version
CREATE TABLE IF NOT EXISTS `ah_student_subject_version` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_subject` (`student_id`, `subject`),
  KEY `idx_student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. 数据迁移：从 ah_student_textbook 提取科目版本信息
-- 注意：只迁移当前学生年级和学期匹配的教材
INSERT INTO `ah_student_subject_version` (`student_id`, `subject`, `version`)
SELECT DISTINCT 
    st.student_id,
    t.subject,
    t.version
FROM `ah_student_textbook` st
INNER JOIN `ah_textbook` t ON st.textbook_id = t.id
INNER JOIN `ah_student` s ON st.student_id = s.id
WHERE t.grade = s.grade 
  AND t.semester = s.semester
  AND NOT EXISTS (
    SELECT 1 FROM `ah_student_subject_version` ssv
    WHERE ssv.student_id = st.student_id 
      AND ssv.subject = t.subject
  );

-- 3. 删除旧表 ah_student_textbook
DROP TABLE IF EXISTS `ah_student_textbook`;
