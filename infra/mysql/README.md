# MySQL 初始化脚本目录

## 说明

此目录下的 `.sql` 文件会在 MySQL 容器首次启动时按文件名顺序自动执行。

## 文件命名规则

建议使用数字前缀来控制执行顺序:

```
00-init.sql       # 数据库初始化
01-schema.sql     # 表结构
02-data.sql       # 初始数据
03-permissions.sql # 权限配置
```

## 注意事项

1. 脚本只在容器**首次创建**时执行
2. 如需重新执行初始化脚本,需删除数据卷:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```
3. 生产环境建议使用 ORM 或迁移工具管理数据库结构

## 示例

### 创建表结构

```sql
-- 01-schema.sql
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 插入初始数据

```sql
-- 02-data.sql
INSERT INTO `sys_config` (`config_key`, `config_value`, `description`)
VALUES
    ('system_name', 'AI Education Platform', '系统名称'),
    ('version', '1.0.0', '系统版本');
```
