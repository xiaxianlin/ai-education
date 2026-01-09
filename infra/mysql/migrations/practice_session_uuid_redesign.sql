-- ============================================================
-- 练习会话重新设计迁移脚本
-- 
-- 变更内容：
-- 1. ah_practice_session.id 从 INT AUTO_INCREMENT 改为 VARCHAR(36) UUID v4
-- 2. ah_practice_session.practice_slug 重命名为 practice_type
-- 3. ah_practice_session_answer.session_id 从 INT 改为 VARCHAR(36)
-- 4. ah_practice_session_report.session_id 从 INT 改为 VARCHAR(36)
-- 5. 更新 generate_status 注释（0=生成中，1=已完成，-1=生成失败）
-- 
-- 练习类型：
-- - ability_practice: 能力练习 - 基于原子能力 code 列表生成
-- - unit_practice: 单元练习 - 基于单元 ID 生成
-- 
-- 执行前请备份数据库！
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 步骤 1: 备份现有数据（可选，建议在生产环境执行）
-- ============================================================

-- CREATE TABLE ah_practice_session_backup AS SELECT * FROM ah_practice_session;
-- CREATE TABLE ah_practice_session_answer_backup AS SELECT * FROM ah_practice_session_answer;
-- CREATE TABLE ah_practice_session_report_backup AS SELECT * FROM ah_practice_session_report;

-- ============================================================
-- 步骤 2: 创建临时表存储 ID 映射
-- ============================================================

CREATE TEMPORARY TABLE IF NOT EXISTS session_id_mapping (
    old_id INT NOT NULL,
    new_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (old_id)
);

-- 为现有会话生成新的 UUID
INSERT INTO session_id_mapping (old_id, new_id)
SELECT id, UUID() FROM ah_practice_session;

-- ============================================================
-- 步骤 3: 修改 ah_practice_session 表
-- ============================================================

-- 3.1 添加新的 UUID 列
ALTER TABLE ah_practice_session 
    ADD COLUMN new_id VARCHAR(36) NOT NULL AFTER id;

-- 3.2 更新新 ID 值
UPDATE ah_practice_session ps
    INNER JOIN session_id_mapping m ON ps.id = m.old_id
    SET ps.new_id = m.new_id;

-- 3.3 添加 practice_type 列（如果 practice_slug 存在则从其复制数据）
ALTER TABLE ah_practice_session 
    ADD COLUMN practice_type VARCHAR(50) NOT NULL DEFAULT 'ability_practice' 
    COMMENT '练习类型: ability_practice/unit_practice' AFTER new_id;

-- 3.4 从 practice_slug 复制数据到 practice_type（如果列存在）
UPDATE ah_practice_session 
    SET practice_type = CASE 
        WHEN practice_slug = 'daily_practice' THEN 'ability_practice'
        WHEN practice_slug = 'unit_practice' THEN 'unit_practice'
        WHEN practice_slug = 'assess_practice' THEN 'ability_practice'
        ELSE 'ability_practice'
    END
    WHERE practice_slug IS NOT NULL;

-- 3.5 更新 generate_status 注释
ALTER TABLE ah_practice_session 
    MODIFY COLUMN generate_status INT NOT NULL DEFAULT 0 
    COMMENT '生成中: 0, 已完成: 1, 生成失败: -1';

-- ============================================================
-- 步骤 4: 修改 ah_practice_session_answer 表
-- ============================================================

-- 4.1 添加新的 session_id 列
ALTER TABLE ah_practice_session_answer 
    ADD COLUMN new_session_id VARCHAR(36) NOT NULL AFTER id;

-- 4.2 更新新 session_id 值
UPDATE ah_practice_session_answer psa
    INNER JOIN session_id_mapping m ON psa.session_id = m.old_id
    SET psa.new_session_id = m.new_id;

-- ============================================================
-- 步骤 5: 修改 ah_practice_session_report 表
-- ============================================================

-- 5.1 添加新的 session_id 列
ALTER TABLE ah_practice_session_report 
    ADD COLUMN new_session_id VARCHAR(36) NOT NULL AFTER id;

-- 5.2 更新新 session_id 值
UPDATE ah_practice_session_report psr
    INNER JOIN session_id_mapping m ON psr.session_id = m.old_id
    SET psr.new_session_id = m.new_id;

-- ============================================================
-- 步骤 6: 删除旧列并重命名新列
-- ============================================================

-- 6.1 ah_practice_session: 删除旧 ID 和 practice_slug，重命名新列
ALTER TABLE ah_practice_session 
    DROP COLUMN id,
    DROP COLUMN practice_slug;

ALTER TABLE ah_practice_session 
    CHANGE COLUMN new_id id VARCHAR(36) NOT NULL 
    COMMENT '会话ID (UUID v4)';

ALTER TABLE ah_practice_session 
    ADD PRIMARY KEY (id);

-- 6.2 ah_practice_session_answer: 删除旧 session_id，重命名新列
ALTER TABLE ah_practice_session_answer 
    DROP COLUMN session_id;

ALTER TABLE ah_practice_session_answer 
    CHANGE COLUMN new_session_id session_id VARCHAR(36) NOT NULL 
    COMMENT '会话ID (UUID v4)';

ALTER TABLE ah_practice_session_answer 
    ADD INDEX idx_session_id (session_id);

-- 6.3 ah_practice_session_report: 删除旧 session_id，重命名新列
ALTER TABLE ah_practice_session_report 
    DROP INDEX session_id,
    DROP COLUMN session_id;

ALTER TABLE ah_practice_session_report 
    CHANGE COLUMN new_session_id session_id VARCHAR(36) NOT NULL 
    COMMENT '会话ID (UUID v4)';

ALTER TABLE ah_practice_session_report 
    ADD UNIQUE INDEX uk_session_id (session_id);

-- ============================================================
-- 步骤 7: 添加索引
-- ============================================================

-- 为 practice_type 添加索引
ALTER TABLE ah_practice_session 
    ADD INDEX idx_practice_type (practice_type);

-- ============================================================
-- 步骤 8: 清理临时表
-- ============================================================

DROP TEMPORARY TABLE IF EXISTS session_id_mapping;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 验证迁移结果
-- ============================================================

-- SELECT COUNT(*) FROM ah_practice_session;
-- SELECT COUNT(*) FROM ah_practice_session_answer;
-- SELECT COUNT(*) FROM ah_practice_session_report;
-- DESCRIBE ah_practice_session;
-- DESCRIBE ah_practice_session_answer;
-- DESCRIBE ah_practice_session_report;
