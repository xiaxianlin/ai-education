/*
 Navicat MySQL Data Transfer

 Source Server         : aliyun
 Source Server Type    : MySQL
 Source Server Version : 80043
 Source Host           : 47.96.105.206:3306
 Source Schema         : ai_education

 Target Server Type    : MySQL
 Target Server Version : 80043
 File Encoding         : 65001

 Date: 16/01/2026 14:43:27
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ah_ability
-- ----------------------------
DROP TABLE IF EXISTS `ah_ability`;
CREATE TABLE `ah_ability` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(50) NOT NULL,
  `grade` int NOT NULL,
  `code` varchar(100) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `difficulty` int NOT NULL,
  `is_active` int NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ability` (`subject`,`grade`,`code`),
  KEY `ix_subject_grade` (`subject`,`grade`),
  KEY `ix_ah_ability_grade` (`grade`),
  KEY `ix_ah_ability_subject` (`subject`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
-- Table structure for ah_practice
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice`;
CREATE TABLE `ah_practice` (
  `id` varchar(36) NOT NULL COMMENT '会话ID (UUID v4)',
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `practice_type` varchar(50) NOT NULL COMMENT '练习类型: ability_practice/unit_practice',
  `subject` varchar(50) DEFAULT NULL COMMENT '科目',
  `grade` int DEFAULT NULL COMMENT '年级',
  `ability_code` varchar(255) DEFAULT NULL COMMENT '原子能力代码列表（JSON数组）',
  `unit_id` int DEFAULT NULL COMMENT '单元ID',
  `question_count` int NOT NULL COMMENT '题目数量',
  `answer_count` int NOT NULL COMMENT '回答数量',
  `correct_count` int NOT NULL COMMENT '正确数量',
  `status` int NOT NULL COMMENT '未开始: 0, 进行中: 1, 已完成: 2, 已废弃: 3',
  `generate_status` int NOT NULL COMMENT '生成中: 0, 已完成: 1, 生成失败: -1',
  `generate_time` int DEFAULT NULL COMMENT '生成耗时(秒)',
  `start_time` int NOT NULL COMMENT '开始时间',
  `end_time` int DEFAULT NULL COMMENT '结束时间',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `ix_ah_practice_unit_id` (`unit_id`),
  KEY `ix_ah_practice_grade` (`grade`),
  KEY `ix_ah_practice_status` (`status`),
  KEY `ix_ah_practice_practice_type` (`practice_type`),
  KEY `ix_ah_practice_generate_status` (`generate_status`),
  KEY `ix_ah_practice_student_id` (`student_id`),
  KEY `ix_ah_practice_subject` (`subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_practice_answer
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice_answer`;
CREATE TABLE `ah_practice_answer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(36) NOT NULL COMMENT '会话ID (UUID v4)',
  `question_id` varchar(255) NOT NULL COMMENT '题目ID',
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `question_order` int NOT NULL COMMENT '题目顺序',
  `answer` text COMMENT '学生答案（JSON格式）',
  `audio_url` varchar(500) DEFAULT NULL COMMENT '音频答案URL',
  `status` int NOT NULL COMMENT '答题状态: 0-未答 1-正确 2-错误',
  `time_spent` int NOT NULL COMMENT '耗时(秒)',
  `submit_time` int DEFAULT NULL COMMENT '提交时间',
  `correct_answer` text COMMENT '正确答案',
  `analysis` text COMMENT '错题分析',
  `is_corrected` int NOT NULL COMMENT '是否已订正 0-未订正 1-已订正',
  `corrected_time` int DEFAULT NULL COMMENT '订正时间',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `ix_ah_practice_answer_student_id` (`student_id`),
  KEY `ix_ah_practice_answer_question_id` (`question_id`),
  KEY `ix_ah_practice_answer_session_id` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_practice_report
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice_report`;
CREATE TABLE `ah_practice_report` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(36) NOT NULL COMMENT '会话ID (UUID v4)',
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `total_questions` int NOT NULL COMMENT '题目数量',
  `correct_questions` int NOT NULL COMMENT '正确数量',
  `total_time` int NOT NULL COMMENT '总耗时(秒)',
  `overall_score` float NOT NULL COMMENT '总得分',
  `current_ability` float NOT NULL COMMENT '当前能力值（-3到+3）',
  `confidence` float NOT NULL COMMENT '置信度',
  `ability_level` varchar(50) NOT NULL COMMENT '能力等级',
  `percentile` int NOT NULL COMMENT '百分位排名',
  `knowledge_scores` text NOT NULL COMMENT '知识点掌握情况',
  `question_distribution` text NOT NULL COMMENT '题目来源分布',
  `ability_breakdown` text NOT NULL COMMENT '能力分解（按难度）',
  `learning_speed` float NOT NULL COMMENT '学习速度',
  `consistency` float NOT NULL COMMENT '稳定性',
  `strengths` text NOT NULL COMMENT '优势',
  `weaknesses` text NOT NULL COMMENT '薄弱点',
  `recommendations` text NOT NULL COMMENT '学习建议',
  `create_time` int NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_ah_practice_report_session_id` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_question
-- ----------------------------
DROP TABLE IF EXISTS `ah_question`;
CREATE TABLE `ah_question` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `question_type_code` varchar(50) NOT NULL COMMENT '题型编码',
  `subject` varchar(50) NOT NULL COMMENT '科目',
  `grade` int NOT NULL COMMENT '年级 1-12',
  `content` json NOT NULL COMMENT '题目内容：包含题干、选项等',
  `answer` json NOT NULL COMMENT '答案配置',
  `difficulty` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '难度',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_question_type
-- ----------------------------
DROP TABLE IF EXISTS `ah_question_type`;
CREATE TABLE `ah_question_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT '题型编码',
  `name` varchar(100) NOT NULL COMMENT '题型名称',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '题型分类: ability_practice / unit_practice',
  `description` text COMMENT '题型描述',
  `subject` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '科目',
  `ability_code` varchar(100) DEFAULT NULL COMMENT '关联能力代码',
  `configs` json DEFAULT NULL COMMENT '配置信息：包含媒体、脚手架、评估配置',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `grade` int DEFAULT '1',
  `semester` varchar(255) DEFAULT NULL COMMENT '当前学期',
  `subject` varchar(255) DEFAULT NULL COMMENT '当前学科',
  `status` int NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ah_student_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_student_ability_mastery
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_ability_mastery`;
CREATE TABLE `ah_student_ability_mastery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `ability_code` varchar(100) NOT NULL COMMENT '原子能力代码',
  `mastery_score` float NOT NULL COMMENT '掌握度 0-100',
  `mastery_level` varchar(20) NOT NULL COMMENT '掌握等级',
  `correct_count` int NOT NULL COMMENT '正确次数',
  `wrong_count` int NOT NULL COMMENT '错误次数',
  `last_practice_time` int DEFAULT NULL COMMENT '最近练习时间',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_ability` (`student_id`,`ability_code`),
  KEY `ix_ah_student_ability_mastery_student_id` (`student_id`),
  KEY `ix_ah_student_ability_mastery_ability_code` (`ability_code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_student_practice
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_practice`;
CREATE TABLE `ah_student_practice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `practice_id` int NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ix_ah_student_practice_student_id` (`student_id`),
  KEY `ix_ah_student_practice_practice_id` (`practice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_student_textbook_config
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_textbook_config`;
CREATE TABLE `ah_student_textbook_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `textbook_id` int NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ah_student_textbook_config_textbook_id` (`textbook_id`),
  KEY `ix_ah_student_textbook_config_student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_teacher_book
-- ----------------------------
DROP TABLE IF EXISTS `ah_teacher_book`;
CREATE TABLE `ah_teacher_book` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  `grade` int NOT NULL,
  `semester` varchar(255) NOT NULL,
  `file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `index_file_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_textbook_version
-- ----------------------------
DROP TABLE IF EXISTS `ah_textbook_version`;
CREATE TABLE `ah_textbook_version` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `revision_year` int NOT NULL,
  `is_enabled` int NOT NULL,
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ah_unit
-- ----------------------------
DROP TABLE IF EXISTS `ah_unit`;
CREATE TABLE `ah_unit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `textbook_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
