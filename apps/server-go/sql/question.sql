-- Question CRUD module SQL reference.
-- The first Go cut keeps repository as an interface; concrete DB wiring can reuse
-- these statements when the shared db package lands.

CREATE TABLE IF NOT EXISTS ah_question_type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '题型名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '题型编码',
    category VARCHAR(50) NOT NULL COMMENT '题型分类: ability_practice/unit_practice',
    description TEXT NULL COMMENT '题型描述',
    subject VARCHAR(50) NULL COMMENT '科目',
    ability_code VARCHAR(100) NULL COMMENT '关联能力代码',
    configs JSON NULL COMMENT '题型配置信息',
    create_time BIGINT NOT NULL,
    update_time BIGINT NOT NULL,
    INDEX idx_question_type_category (category),
    INDEX idx_question_type_subject_ability (subject, ability_code)
);

CREATE TABLE IF NOT EXISTS ah_question (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
    question_type_code VARCHAR(50) NOT NULL COMMENT '题型编码',
    subject VARCHAR(50) NOT NULL COMMENT '科目',
    grade INT NOT NULL COMMENT '年级 1-12',
    content JSON NOT NULL COMMENT '题目内容：包含题干、选项等',
    answer JSON NOT NULL COMMENT '答案配置',
    difficulty VARCHAR(20) NULL COMMENT '难度',
    create_time BIGINT NOT NULL,
    update_time BIGINT NOT NULL,
    INDEX idx_question_type_code (question_type_code),
    INDEX idx_question_subject_grade (subject, grade),
    INDEX idx_question_create_time (create_time)
);

-- name: SearchQuestions
SELECT *
FROM ah_question
WHERE (:id = '' OR id = :id)
  AND (:question_type_code = '' OR question_type_code = :question_type_code)
  AND (:subject = '' OR subject = :subject)
  AND (:grade = 0 OR grade = :grade)
ORDER BY create_time DESC
LIMIT :limit OFFSET :offset;

-- name: CountQuestions
SELECT COUNT(id)
FROM ah_question
WHERE (:id = '' OR id = :id)
  AND (:question_type_code = '' OR question_type_code = :question_type_code)
  AND (:subject = '' OR subject = :subject)
  AND (:grade = 0 OR grade = :grade);

-- name: GetQuestion
SELECT *
FROM ah_question
WHERE id = :id;

-- name: UpdateQuestion
UPDATE ah_question
SET content = COALESCE(:content, content),
    answer = COALESCE(:answer, answer),
    update_time = :update_time
WHERE id = :id;

-- name: DeleteQuestion
DELETE FROM ah_question
WHERE id = :id;

-- name: CreateQuestionType
INSERT INTO ah_question_type (
    name, code, category, description, subject, ability_code, configs, create_time, update_time
) VALUES (
    :name, :code, :category, :description, :subject, :ability_code, JSON_OBJECT(), :create_time, :update_time
);

-- name: UpdateQuestionType
UPDATE ah_question_type
SET name = :name,
    code = :code,
    category = :category,
    description = COALESCE(:description, description),
    subject = COALESCE(:subject, subject),
    ability_code = COALESCE(:ability_code, ability_code),
    update_time = :update_time
WHERE id = :id;

-- name: DeleteQuestionType
DELETE FROM ah_question_type
WHERE id = :id;

-- name: SearchUnitPracticeTypes
SELECT *
FROM ah_question_type
WHERE category = 'unit_practice'
ORDER BY id;

-- name: SearchAbilityPracticeTypes
SELECT qt.*
FROM ah_question_type qt
JOIN ah_ability a ON a.code = qt.ability_code
WHERE qt.category = 'ability_practice'
  AND qt.subject = :subject
  AND a.grade = :grade
  AND a.subject = :subject
ORDER BY qt.ability_code, qt.id;

-- name: GetQuestionTypeByCode
SELECT *
FROM ah_question_type
WHERE code = :code;

-- name: UpdateQuestionTypeConfigs
UPDATE ah_question_type
SET configs = :configs,
    update_time = :update_time
WHERE code = :code;

