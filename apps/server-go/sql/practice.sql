-- Practice core SQL reference.
-- This migration cut exposes repository interfaces first; concrete DB wiring can
-- bind these statements without changing handlers or service code.

CREATE TABLE IF NOT EXISTS ah_practice (
    id VARCHAR(36) PRIMARY KEY COMMENT '练习会话 ID (UUID v4)',
    student_id VARCHAR(255) NOT NULL COMMENT '学生 ID',
    practice_type VARCHAR(50) NOT NULL COMMENT 'ability_practice/unit_practice',
    subject VARCHAR(50) NULL COMMENT '科目',
    grade INT NULL COMMENT '年级',
    ability_code VARCHAR(255) NULL COMMENT '能力代码',
    unit_id BIGINT NULL COMMENT '单元 ID',
    question_count INT NOT NULL DEFAULT 0 COMMENT '题目数量',
    answer_count INT NOT NULL DEFAULT 0 COMMENT '回答数量',
    correct_count INT NOT NULL DEFAULT 0 COMMENT '正确数量',
    status INT NOT NULL DEFAULT 0 COMMENT '0 未开始, 1 进行中, 2 已完成, 3 已废弃',
    generate_status INT NOT NULL DEFAULT 0 COMMENT '0 生成中, 1 已完成, -1 生成失败',
    generate_time INT NULL COMMENT '生成耗时(秒)',
    start_time BIGINT NOT NULL COMMENT '开始时间',
    end_time BIGINT NULL COMMENT '结束时间',
    create_time BIGINT NOT NULL COMMENT '创建时间',
    update_time BIGINT NOT NULL COMMENT '更新时间',
    INDEX idx_practice_student (student_id),
    INDEX idx_practice_type (practice_type),
    INDEX idx_practice_subject_grade (subject, grade),
    INDEX idx_practice_ability (ability_code),
    INDEX idx_practice_unit (unit_id),
    INDEX idx_practice_status (status),
    INDEX idx_practice_generate_status (generate_status),
    INDEX idx_practice_create_time (create_time)
);

CREATE TABLE IF NOT EXISTS ah_practice_answer (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(36) NOT NULL COMMENT '练习会话 ID',
    question_id VARCHAR(255) NOT NULL COMMENT '题目 ID',
    student_id VARCHAR(255) NOT NULL COMMENT '学生 ID',
    question_order INT NOT NULL COMMENT '题目顺序',
    answer JSON NULL COMMENT '学生答案',
    audio_url VARCHAR(500) NULL COMMENT '音频答案 URL',
    status INT NOT NULL DEFAULT 0 COMMENT '0 未答, 1 正确, 2 错误',
    time_spent INT NOT NULL DEFAULT 0 COMMENT '耗时(秒)',
    submit_time BIGINT NULL COMMENT '提交时间',
    correct_answer JSON NULL COMMENT '结构化正确答案',
    analysis JSON NULL COMMENT '错题分析',
    is_corrected INT NOT NULL DEFAULT 0 COMMENT '0 未订正, 1 已订正',
    corrected_time BIGINT NULL COMMENT '订正时间',
    create_time BIGINT NOT NULL COMMENT '创建时间',
    update_time BIGINT NOT NULL COMMENT '更新时间',
    UNIQUE KEY uk_practice_answer (session_id, question_id),
    INDEX idx_practice_answer_session (session_id),
    INDEX idx_practice_answer_question (question_id),
    INDEX idx_practice_answer_student (student_id),
    INDEX idx_practice_answer_order (session_id, question_order)
);

CREATE TABLE IF NOT EXISTS ah_practice_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(36) NOT NULL UNIQUE COMMENT '练习会话 ID',
    student_id VARCHAR(255) NOT NULL COMMENT '学生 ID',
    total_questions INT NOT NULL DEFAULT 0 COMMENT '题目数量',
    correct_questions INT NOT NULL DEFAULT 0 COMMENT '正确数量',
    total_time INT NOT NULL DEFAULT 0 COMMENT '总耗时(秒)',
    overall_score DOUBLE NOT NULL DEFAULT 0 COMMENT '总得分',
    current_ability DOUBLE NOT NULL DEFAULT 0 COMMENT '当前能力值',
    confidence DOUBLE NOT NULL DEFAULT 0 COMMENT '置信度',
    ability_level VARCHAR(50) NOT NULL DEFAULT '' COMMENT '能力等级',
    percentile INT NOT NULL DEFAULT 0 COMMENT '百分位排名',
    knowledge_scores JSON NOT NULL COMMENT '知识点掌握情况',
    question_distribution JSON NOT NULL COMMENT '题目来源分布',
    ability_breakdown JSON NOT NULL COMMENT '能力分解',
    learning_speed DOUBLE NOT NULL DEFAULT 0 COMMENT '学习速度',
    consistency DOUBLE NOT NULL DEFAULT 0 COMMENT '稳定性',
    strengths JSON NOT NULL COMMENT '优势',
    weaknesses JSON NOT NULL COMMENT '薄弱点',
    recommendations JSON NOT NULL COMMENT '学习建议',
    create_time BIGINT NOT NULL COMMENT '创建时间',
    INDEX idx_practice_report_session (session_id),
    INDEX idx_practice_report_student (student_id)
);

-- name: CreatePractice
INSERT INTO ah_practice (
    id, student_id, practice_type, subject, grade, ability_code, unit_id,
    question_count, answer_count, correct_count, status, generate_status,
    generate_time, start_time, end_time, create_time, update_time
) VALUES (
    :id, :student_id, :practice_type, :subject, :grade, :ability_code, :unit_id,
    :question_count, :answer_count, :correct_count, :status, :generate_status,
    :generate_time, :start_time, :end_time, :create_time, :update_time
);

-- name: GetPractice
SELECT *
FROM ah_practice
WHERE id = :session_id
  AND student_id = :student_id;

-- name: GetOpenAbilityPractice
SELECT *
FROM ah_practice
WHERE student_id = :student_id
  AND practice_type = 'ability_practice'
  AND ability_code = :ability_code
  AND status != 2
ORDER BY create_time DESC
LIMIT 1;

-- name: GetOpenUnitPractice
SELECT *
FROM ah_practice
WHERE student_id = :student_id
  AND practice_type = 'unit_practice'
  AND unit_id = :unit_id
  AND status != 2
ORDER BY create_time DESC
LIMIT 1;

-- name: ListPractices
SELECT *
FROM ah_practice
WHERE student_id = :student_id
  AND (:practice_type = '' OR practice_type = :practice_type)
  AND (:subject = '' OR subject = :subject)
  AND (:grade = 0 OR grade = :grade)
ORDER BY create_time DESC
LIMIT :limit OFFSET :offset;

-- name: UpdatePracticeState
UPDATE ah_practice
SET status = :status,
    generate_status = :generate_status,
    answer_count = :answer_count,
    correct_count = :correct_count,
    start_time = :start_time,
    end_time = :end_time,
    update_time = :update_time
WHERE id = :session_id
  AND student_id = :student_id;

-- name: GetPracticeAnswer
SELECT *
FROM ah_practice_answer
WHERE session_id = :session_id
  AND question_id = :question_id
  AND student_id = :student_id;

-- name: UpdatePracticeAnswer
UPDATE ah_practice_answer
SET answer = :answer,
    audio_url = :audio_url,
    status = :status,
    time_spent = :time_spent,
    submit_time = :submit_time,
    correct_answer = :correct_answer,
    analysis = :analysis,
    update_time = :update_time
WHERE session_id = :session_id
  AND question_id = :question_id
  AND student_id = :student_id;
