-- 数据库迁移脚本：学生信息表优化设计
-- 创建时间: 2025-11-04

-- 1. 创建学生详情配置表
CREATE TABLE IF NOT EXISTS ah_student_profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(255) NOT NULL UNIQUE,
    grade INT DEFAULT 0,
    textbook_version VARCHAR(255) DEFAULT '',
    semester VARCHAR(50) DEFAULT '',
    preferred_subjects VARCHAR(500) DEFAULT '',
    difficulty_preference VARCHAR(50) DEFAULT '中等',
    create_time INT DEFAULT 0,
    update_time INT DEFAULT 0,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 创建学习统计表
CREATE TABLE IF NOT EXISTS ah_student_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(255) NOT NULL UNIQUE,
    total_practice INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    correct_questions INT DEFAULT 0,
    accuracy DOUBLE DEFAULT 0.0,
    current_streak INT DEFAULT 0,
    max_streak INT DEFAULT 0,
    last_study_date INT DEFAULT 0,
    total_study_duration INT DEFAULT 0,
    achievements TEXT DEFAULT '',
    create_time INT DEFAULT 0,
    update_time INT DEFAULT 0,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 创建学习记录表
CREATE TABLE IF NOT EXISTS ah_study_record (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(255) NOT NULL,
    textbook_id INT NOT NULL,
    unit_id INT DEFAULT NULL,
    knowledge_id INT DEFAULT NULL,
    question_id INT DEFAULT NULL,
    is_correct INT DEFAULT 0,
    score DOUBLE DEFAULT 0.0,
    time_spent INT DEFAULT 0,
    study_date INT DEFAULT 0,
    create_time INT DEFAULT 0,
    INDEX idx_student_id (student_id),
    INDEX idx_study_date (study_date),
    INDEX idx_textbook_id (textbook_id),
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 创建错题本表（如果不存在）
CREATE TABLE IF NOT EXISTS ah_student_wrong_question (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(255) NOT NULL,
    question_id INT NOT NULL,
    wrong_count INT DEFAULT 1,
    last_wrong_time INT DEFAULT 0,
    is_mastered INT DEFAULT 0,
    mastered_time INT DEFAULT 0,
    create_time INT DEFAULT 0,
    update_time INT DEFAULT 0,
    UNIQUE KEY uk_student_question (student_id, question_id),
    INDEX idx_student_id (student_id),
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 为错题表添加索引（如果表已存在）
ALTER TABLE ah_student_wrong_question
ADD INDEX IF NOT EXISTS idx_student_id (student_id),
ADD INDEX IF NOT EXISTS idx_question_id (question_id),
ADD UNIQUE INDEX IF NOT EXISTS uk_student_question (student_id, question_id);

-- 6. 为现有学习记录表添加索引（如果表已存在）
ALTER TABLE ah_study_record
ADD INDEX IF NOT EXISTS idx_student_id (student_id),
ADD INDEX IF NOT EXISTS idx_study_date (study_date),
ADD INDEX IF NOT EXISTS idx_textbook_id (textbook_id),
ADD INDEX IF NOT EXISTS idx_question_id (question_id);

-- 7. 为学生详情配置表添加索引（如果表已存在）
ALTER TABLE ah_student_profile
ADD INDEX IF NOT EXISTS idx_student_id (student_id);

-- 8. 为学习统计表添加索引（如果表已存在）
ALTER TABLE ah_student_stats
ADD INDEX IF NOT EXISTS idx_student_id (student_id);
