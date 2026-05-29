CREATE TABLE IF NOT EXISTS `ah_ability` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(50) NOT NULL,
  `grade` int NOT NULL,
  `code` varchar(100) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `difficulty` int NOT NULL DEFAULT 1,
  `is_active` int NOT NULL DEFAULT 1,
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ability` (`subject`, `grade`, `code`),
  KEY `ix_subject_grade` (`subject`, `grade`),
  KEY `ix_ah_ability_grade` (`grade`),
  KEY `ix_ah_ability_subject` (`subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

