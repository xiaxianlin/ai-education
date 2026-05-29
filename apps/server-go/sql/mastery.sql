CREATE TABLE IF NOT EXISTS `ah_student_ability_mastery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `ability_code` varchar(100) NOT NULL,
  `mastery_score` double NOT NULL DEFAULT 0,
  `mastery_level` varchar(20) NOT NULL DEFAULT 'unlearned',
  `correct_count` int NOT NULL DEFAULT 0,
  `wrong_count` int NOT NULL DEFAULT 0,
  `last_practice_time` int DEFAULT NULL,
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_ability` (`student_id`, `ability_code`),
  KEY `ix_ah_student_ability_mastery_student_id` (`student_id`),
  KEY `ix_ah_student_ability_mastery_ability_code` (`ability_code`),
  KEY `ix_student_mastery_score` (`student_id`, `mastery_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Practice statistics reads from ah_practice:
-- - student_id matches current student
-- - status != 3 is excluded
-- - recent_30_days additionally filters create_time >= current_time - 30 days
-- The ah_practice table DDL is owned by the practice migration module.
