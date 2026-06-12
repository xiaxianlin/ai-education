# Phase 3 — 规模化实施概要

> **预估工期**: 10+周 | **前置**: Phase 2 完成
> 注: Phase 3 各功能的详细实施规格将在 Phase 2 完成后编写

---

## P3-01 机构/学校管理 (5天)

### 数据模型

**新增表**:

```sql
CREATE TABLE ah_tenant (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50),          -- school/institution
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 现有表新增 tenant_id
ALTER TABLE ah_student ADD COLUMN tenant_id BIGINT;
ALTER TABLE ah_manager ADD COLUMN tenant_id BIGINT;
ALTER TABLE ah_textbook ADD COLUMN tenant_id BIGINT;
```

### 数据隔离

采用**共享表 + tenant_id** 策略，所有查询自动附加 tenant_id 条件。

---

## P3-02 教师班级管理 (3天)

### 数据模型

```sql
CREATE TABLE ah_class (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    name VARCHAR(100),
    grade INT,
    teacher_id BIGINT,
    academic_year VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ah_class_student (
    class_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    PRIMARY KEY (class_id, student_id)
);
```

### 接口

```
POST   /api/admin/class                  # 创建班级
GET    /api/admin/class/search           # 班级列表
POST   /api/admin/class/{id}/students    # 批量导入学生
DELETE /api/admin/class/{id}/students/{student_id}  # 移除学生
GET    /api/teacher/class/{id}/report    # 班级练习报告
```

---

## P3-03 权限体系升级 RBAC (5天)

### 角色定义

| 角色 | 权限范围 |
|------|----------|
| super_admin | 全平台管理 |
| tenant_admin | 本机构管理 |
| teacher | 本班级学生管理、数据查看 |
| student | 练习、查看自己的数据 |

### 数据模型

**新增 RBAC 相关表**：

```sql
-- 角色表
CREATE TABLE ah_role (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(50) NOT NULL UNIQUE,  -- super_admin, tenant_admin, teacher, student
    name        VARCHAR(100) NOT NULL,         -- 显示名称
    description VARCHAR(500),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE ah_permission (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource    VARCHAR(100) NOT NULL,  -- practice, student, question, class, ...
    action      VARCHAR(50) NOT NULL,   -- list, create, update, delete
    description VARCHAR(500),
    UNIQUE KEY uk_resource_action (resource, action)
);

-- 角色-权限关联表
CREATE TABLE ah_role_permission (
    role_id       BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id)       REFERENCES ah_role(id),
    FOREIGN KEY (permission_id) REFERENCES ah_permission(id)
);

-- 索引
CREATE INDEX idx_role_permission_role ON ah_role_permission(role_id);
```

### 用户-角色关联

角色通过以下方式与现有用户表关联：

```sql
-- manager 表新增角色字段（简洁方案：一个用户一个角色）
ALTER TABLE ah_manager ADD COLUMN role_code VARCHAR(50) DEFAULT 'teacher';
ALTER TABLE ah_manager ADD CONSTRAINT fk_manager_role FOREIGN KEY (role_code) REFERENCES ah_role(code);

-- 如果未来需要多角色支持，可新增关联表（扩展方案）：
-- CREATE TABLE ah_manager_role (
--     manager_id BIGINT NOT NULL,
--     role_id    BIGINT NOT NULL,
--     PRIMARY KEY (manager_id, role_id),
--     FOREIGN KEY (manager_id) REFERENCES ah_manager(id),
--     FOREIGN KEY (role_id)    REFERENCES ah_role(id)
-- );

-- student 默认拥有 student 角色（通过代码逻辑判断，无需额外关联表）
```

### 初始数据

```sql
-- 预置角色
INSERT INTO ah_role (code, name, description) VALUES
    ('super_admin', '超级管理员', '全平台管理权限'),
    ('tenant_admin', '机构管理员', '本机构管理权限'),
    ('teacher', '教师', '本班级学生管理与数据查看'),
    ('student', '学生', '练习与查看自身数据');

-- 预置权限
INSERT INTO ah_permission (resource, action, description) VALUES
    ('practice', 'list',   '查看练习列表'),
    ('practice', 'create', '创建练习'),
    ('student',  'list',   '查看学生列表'),
    ('student',  'detail', '查看学生详情'),
    ('question', 'list',   '查看题目列表'),
    ('question', 'create', '创建/编辑题目'),
    ('question', 'delete', '删除题目'),
    ('class',    'list',   '查看班级列表'),
    ('class',    'manage', '管理班级'),
    ('tenant',   'manage', '管理机构设置'),
    ('report',   'view',   '查看数据报表');

-- super_admin 拥有全部权限
INSERT INTO ah_role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM ah_role r CROSS JOIN ah_permission p WHERE r.code = 'super_admin';

-- tenant_admin 拥有除 tenant:manage 以外的管理权限
INSERT INTO ah_role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM ah_role r CROSS JOIN ah_permission p
    WHERE r.code = 'tenant_admin' AND NOT (p.resource = 'tenant' AND p.action = 'manage');

-- teacher 权限
INSERT INTO ah_role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM ah_role r CROSS JOIN ah_permission p
    WHERE r.code = 'teacher' AND (p.resource, p.action) IN (
        ('practice', 'list'), ('practice', 'create'),
        ('student', 'list'), ('student', 'detail'),
        ('question', 'list'), ('question', 'create'),
        ('class', 'list'), ('class', 'manage'),
        ('report', 'view')
    );

-- student 权限
INSERT INTO ah_role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM ah_role r CROSS JOIN ah_permission p
    WHERE r.code = 'student' AND (p.resource, p.action) IN (
        ('practice', 'list'), ('practice', 'create'),
        ('student', 'detail'),
        ('question', 'list')
    );
```

### 实现

**文件**: `server-go/internal/auth/rbac.go`（新建）

```go
type Role string
const (
    RoleSuperAdmin Role = "super_admin"
    RoleTenantAdmin Role = "tenant_admin"
    RoleTeacher    Role = "teacher"
    RoleStudent    Role = "student"
)

type Permission struct {
    Resource string // practice, student, question, ...
    Actions  []string // list, create, update, delete
}
```

Middleware 中根据角色和权限拦截请求。

---

## P3-04 教学数据大屏 (5天)

### 方案

管理端新增数据分析仪表盘：

- 班级练习完成率
- 能力掌握度分布热力图
- 练习趋势折线图
- 薄弱项 Top10

**前端**: 使用 ECharts/AntV 可视化库

---

## P3-05 学生成长档案 (5天)

### 方案

时间维度的学习能力变化：

- 各能力点掌握度月度趋势
- 练习频率和正确率变化
- AI 生成的学习评语

---

## P3-06 教师教学建议 (5天)

### 方案

AI 分析班级整体数据，为教师提供教学建议：

```
POST /api/admin/class/{id}/teaching-advice
Response: {
  weak_areas: ["计算能力", "阅读理解"],
  suggestions: ["建议增加口算练习频率", "推荐使用XX教材补充练习"],
  student_alerts: [{student_id: 1, reason: "连续3次练习正确率下降"}]
}
```

---

## P3-07 家长端 (10天)

### 方案

新建微信小程序/H5应用：

- 查看孩子学习报告
- 接收练习完成通知
- 查看能力掌握度
- 教师留言

---

## P3-08 离线练习支持 (5天)

### 方案

移动端本地缓存：

- 下载题目包到本地 SQLite
- 离线答题，本地评判（客观题）
- 网络恢复后同步结果

---

## P3-09 性能优化 (5天)

### 方案

- **缓存**: Redis 缓存高频查询（掌握度、能力列表）
- **SQL 优化**: 慢查询分析、索引优化
- **CDN**: 静态资源 CDN 分发
- **分页优化**: 游标分页替代 OFFSET
