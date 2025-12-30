-- ============================================================
-- V2 题型系统数据表创建脚本
-- 执行方式: mysql -u root -p ai_education < scripts/create_v2_tables.sql
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table: ah_question_type_v2 (题型配置表V2)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `ah_question_type_v2` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  
  -- 基础信息
  `code` varchar(50) NOT NULL COMMENT '题型编码，如 pinyin_choice',
  `name` varchar(100) NOT NULL COMMENT '题型名称，如 看图选拼音',
  `description` text COMMENT '题型描述',
  
  -- 适用范围
  `subject` varchar(50) NOT NULL COMMENT '科目：语文/数学/英语',
  `stages` json NOT NULL COMMENT '适用学段列表，如 ["primary_low", "primary_high"]',
  `grades` json NOT NULL COMMENT '适用年级列表，如 [1, 2, 3]',
  
  -- 交互配置
  `interaction_type` varchar(50) NOT NULL COMMENT '交互类型',
  `interaction_config` json COMMENT '交互配置（布局、样式等）',
  
  -- 资源配置
  `resource_type` varchar(50) NOT NULL DEFAULT 'text' COMMENT '资源类型：none/text/image/audio/video/animation',
  `resource_config` json COMMENT '资源配置（尺寸、时长等）',
  
  -- 答案配置
  `answer_type` varchar(50) NOT NULL COMMENT '答案类型：exact/fuzzy/rubric/ai/composite',
  `answer_config` json COMMENT '答案配置（评分规则等）',
  
  -- 反馈配置
  `feedback_config` json COMMENT '反馈配置（正确/错误提示、音效、动画等）',
  
  -- 认知与能力
  `cognitive_levels` json COMMENT '认知层次列表',
  `ability_dimensions` json COMMENT '能力维度列表',
  
  -- AI生成
  `ai_prompt` text COMMENT 'AI生成指令',
  `output_schema` json COMMENT 'AI输出JSON Schema',
  
  -- 元数据
  `sort_order` int DEFAULT 0 COMMENT '排序',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '是否启用',
  `create_time` bigint NOT NULL COMMENT '创建时间',
  `update_time` bigint NOT NULL COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_subject` (`subject`),
  KEY `idx_interaction_type` (`interaction_type`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题型配置表V2';


-- ----------------------------
-- Table: ah_question_v2 (题目表V2)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `ah_question_v2` (
  `id` varchar(36) NOT NULL COMMENT 'UUID主键',
  
  -- 题型关联
  `question_type_id` int NOT NULL COMMENT '题型ID',
  `question_type_code` varchar(50) NOT NULL COMMENT '题型编码（冗余）',
  
  -- 基础信息
  `subject` varchar(50) NOT NULL COMMENT '科目',
  `grade` int NOT NULL COMMENT '年级 1-12',
  `stage` varchar(20) NOT NULL COMMENT '学段',
  
  -- 教材关联
  `textbook_id` int COMMENT '教材ID',
  `unit_id` int COMMENT '单元ID',
  
  -- 题目内容
  `stem` json NOT NULL COMMENT '题干（支持富文本、子题等）',
  `options` json COMMENT '选项列表',
  `blanks` json COMMENT '填空位置配置',
  
  -- 资源
  `resources` json COMMENT '资源列表（多资源支持）',
  
  -- 答案
  `answer` json NOT NULL COMMENT '答案配置',
  `explanation` text COMMENT '解析',
  
  -- 难度与认知
  `difficulty` varchar(20) NOT NULL COMMENT '难度：easy/medium/hard',
  `cognitive_level` varchar(20) COMMENT '认知层次',
  
  -- 知识点
  `knowledge_points` json COMMENT '知识点列表',
  `ability_tags` json COMMENT '能力标签',
  
  -- 来源
  `source` varchar(50) DEFAULT 'ai' COMMENT '来源：ai/manual/import',
  `prompt_id` int COMMENT '生成此题的Prompt ID',
  
  -- 统计
  `usage_count` int DEFAULT 0 COMMENT '使用次数',
  `correct_rate` varchar(10) COMMENT '正确率',
  `avg_time_spent` int COMMENT '平均用时(秒)',
  
  -- 元数据
  `is_active` tinyint(1) DEFAULT 1 COMMENT '是否启用',
  `create_time` bigint NOT NULL COMMENT '创建时间',
  `update_time` bigint NOT NULL COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  KEY `idx_question_type_id` (`question_type_id`),
  KEY `idx_subject_grade` (`subject`, `grade`),
  KEY `idx_stage` (`stage`),
  KEY `idx_textbook_unit` (`textbook_id`, `unit_id`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目表V2';


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 执行完成提示
-- ============================================================
SELECT 'V2 tables created successfully!' AS result;
SELECT 
  TABLE_NAME, 
  TABLE_COMMENT 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME LIKE 'ah_question%v2';

