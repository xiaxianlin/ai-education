-- 练习模块重构：添加 Practice 表和迁移数据
-- 执行前请备份数据库

-- 1. 创建 Practice 表
CREATE TABLE IF NOT EXISTS ah_practice (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '练习名称',
    slug VARCHAR(100) NOT NULL UNIQUE COMMENT '练习标识',
    icon VARCHAR(255) COMMENT '图标URL',
    description TEXT COMMENT '描述',
    type VARCHAR(20) NOT NULL COMMENT '类型：system/custom',
    practice_type VARCHAR(50) COMMENT '系统练习标识（兼容旧逻辑）',
    config TEXT DEFAULT '{}' COMMENT '配置信息JSON',
    create_time BIGINT NOT NULL COMMENT '创建时间',
    update_time BIGINT NOT NULL COMMENT '更新时间',
    INDEX idx_slug (slug),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='练习表';

-- 2. 初始化3个系统练习
INSERT INTO ah_practice (name, slug, type, practice_type, config, create_time, update_time) VALUES
('日常练习', 'daily_practice', 'system', 'daily_practice', '{"default":{"generate_count":15,"recall_count":0}}', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('单元练习', 'unit_practice', 'system', 'unit_practice', '{"default":{"generate_count":15,"recall_count":0}}', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('综合评估', 'assessment', 'system', 'assessment', '{"default":{"generate_count":25,"recall_count":0}}', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. 添加 practice_id 字段到 PracticeSession
ALTER TABLE ah_practice_session ADD COLUMN IF NOT EXISTS practice_id INT NULL COMMENT '练习ID' AFTER session_type;
ALTER TABLE ah_practice_session ADD INDEX IF NOT EXISTS idx_practice_id (practice_id);

-- 4. 数据迁移：根据 session_type 设置 practice_id
UPDATE ah_practice_session ps 
SET ps.practice_id = (SELECT id FROM ah_practice WHERE practice_type = ps.session_type LIMIT 1)
WHERE ps.session_type IN ('daily_practice', 'unit_practice', 'assessment')
  AND ps.practice_id IS NULL;

