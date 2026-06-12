CREATE TABLE IF NOT EXISTS ah_textbook (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  teacher_id VARCHAR(64) NULL,
  subject VARCHAR(255) NOT NULL,
  version VARCHAR(255) NOT NULL,
  grade INT NOT NULL,
  semester VARCHAR(255) NOT NULL,
  KEY idx_ah_textbook_teacher_id (teacher_id),
  KEY idx_ah_textbook_subject_grade (subject, grade)
);

CREATE TABLE IF NOT EXISTS ah_unit (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  textbook_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  KEY idx_ah_unit_textbook_id (textbook_id),
  CONSTRAINT fk_ah_unit_textbook FOREIGN KEY (textbook_id) REFERENCES ah_textbook (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ah_textbook_version (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subject VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  revision_year INT NOT NULL,
  is_enabled INT NOT NULL DEFAULT 1,
  create_time BIGINT NOT NULL DEFAULT 0,
  update_time BIGINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_ah_textbook_version_subject_name_year (subject, name, revision_year),
  KEY idx_ah_textbook_version_subject (subject)
);

CREATE TABLE IF NOT EXISTS ah_teacher_book (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  teacher_id VARCHAR(64) NULL,
  subject VARCHAR(255) NOT NULL,
  version VARCHAR(255) NOT NULL,
  grade INT NOT NULL,
  semester VARCHAR(255) NOT NULL,
  KEY idx_ah_teacher_book_teacher_id (teacher_id),
  KEY idx_ah_teacher_book_subject_grade (subject, grade)
);
