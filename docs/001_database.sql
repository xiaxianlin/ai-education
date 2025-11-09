/*
 Navicat Premium Dump SQL

 Source Server         : 阿里云
 Source Server Type    : MySQL
 Source Server Version : 80043 (8.0.43-0ubuntu0.22.04.1)
 Source Host           : 47.96.105.206:3306
 Source Schema         : ai_helper

 Target Server Type    : MySQL
 Target Server Version : 80043 (8.0.43-0ubuntu0.22.04.1)
 File Encoding         : 65001

 Date: 09/11/2025 17:32:42
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ah_knowledge
-- ----------------------------
DROP TABLE IF EXISTS `ah_knowledge`;
CREATE TABLE `ah_knowledge` (
  `id` int NOT NULL AUTO_INCREMENT,
  `textbook_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `status` int NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_manager
-- ----------------------------
DROP TABLE IF EXISTS `ah_manager`;
CREATE TABLE `ah_manager` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `type` int NOT NULL,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ah_manager_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_question
-- ----------------------------
DROP TABLE IF EXISTS `ah_question`;
CREATE TABLE `ah_question` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` text NOT NULL COMMENT '科目',
  `grade` int NOT NULL COMMENT '年级',
  `type` varchar(255) NOT NULL COMMENT '题目类型',
  `subtype` varchar(255) DEFAULT NULL COMMENT '题目子类型',
  `content` text NOT NULL COMMENT '题目内容',
  `options` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '选项',
  `answer` text NOT NULL COMMENT '问题答案',
  `difficulty` varchar(255) DEFAULT NULL,
  `resource` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '资源路径',
  `resource_type` varchar(50) DEFAULT NULL COMMENT '资源类型：image-图片，audio-语音，空-无资源',
  `resource_content` text COMMENT '资源内容（录音文本等）',
  `textbook_id` int NOT NULL,
  `unit_id` int DEFAULT NULL,
  `knowledge` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '知识点',
  `status` int NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_student
-- ----------------------------
DROP TABLE IF EXISTS `ah_student`;
CREATE TABLE `ah_student` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `status` int NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ah_student_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_student_profile
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_profile`;
CREATE TABLE `ah_student_profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `preferred_subjects` varchar(500) NOT NULL,
  `difficulty_preference` varchar(50) NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  `current_textbook_id` int DEFAULT NULL COMMENT '当前学习教材ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_student_stats
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_stats`;
CREATE TABLE `ah_student_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `total_practice` int NOT NULL,
  `total_questions` int NOT NULL,
  `correct_questions` int NOT NULL,
  `accuracy` float NOT NULL,
  `current_streak` int NOT NULL,
  `max_streak` int NOT NULL,
  `last_study_date` int NOT NULL,
  `total_study_duration` int NOT NULL,
  `achievements` text NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_student_textbook
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_textbook`;
CREATE TABLE `ah_student_textbook` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `textbook_id` int NOT NULL,
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_student_wrong_question
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_wrong_question`;
CREATE TABLE `ah_student_wrong_question` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `question_id` int NOT NULL,
  `wrong_count` int NOT NULL,
  `last_wrong_time` int NOT NULL,
  `is_mastered` int NOT NULL,
  `mastered_time` int NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_study_record
-- ----------------------------
DROP TABLE IF EXISTS `ah_study_record`;
CREATE TABLE `ah_study_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `textbook_id` int NOT NULL,
  `unit_id` int DEFAULT NULL,
  `knowledge` varchar(255) DEFAULT NULL,
  `question_id` int DEFAULT NULL,
  `is_correct` int NOT NULL,
  `score` float NOT NULL,
  `time_spent` int NOT NULL,
  `study_date` int NOT NULL,
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_textbook
-- ----------------------------
DROP TABLE IF EXISTS `ah_textbook`;
CREATE TABLE `ah_textbook` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  `grade` int NOT NULL,
  `semester` varchar(255) NOT NULL,
  `file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `index_file_id` varchar(255) DEFAULT NULL,
  `is_parsed` int DEFAULT '0',
  `status` int DEFAULT '1',
  `create_time` int DEFAULT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_unit
-- ----------------------------
DROP TABLE IF EXISTS `ah_unit`;
CREATE TABLE `ah_unit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `textbook_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `status` int DEFAULT '1',
  `create_time` int DEFAULT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
