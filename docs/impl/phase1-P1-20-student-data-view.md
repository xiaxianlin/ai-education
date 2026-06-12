# P1-20 学生练习数据查看（管理端/教师端）

> **优先级**: P1 | **预估工期**: 2天 | **前置依赖**: P1-06
> **状态**: 📋 待开发

---

## 现状分析

**已有基础**:
- `admin-web/src/pages/Student/StudentDetail/` — 学生详情页，含 `PracticeList` 组件
- `admin-web/src/pages/Practice/PracticeDetail/` — 练习详情页，含 Report tab
- 后端已有 `GET /api/admin/practice/search` 支持按学生 ID 筛选

**缺失**:
- 教师查看关联学生的练习数据
- 学生详情页中掌握度可视化
- 练习报告的管理端展示不完整

---

## 实现方案

### Step 1: 学生详情页增强

**文件**: `admin-web/src/pages/Student/StudentDetail/views/PracticeList.tsx`

展示学生的练习历史列表：

```tsx
export function PracticeList({ studentId }: { studentId: number }) {
  const { data, loading } = useRequest(
    () => apiClient.get('/api/admin/practice/search', { student_id: studentId, page: 1, size: 20 })
  );

  const columns = [
    { title: '练习类型', dataIndex: 'type', render: t => t === 'ability' ? '能力练习' : '单元练习' },
    { title: '题目数', dataIndex: 'question_count' },
    { title: '正确率', render: (_, r) => r.question_count > 0 
      ? `${Math.round(r.correct_count / r.question_count * 100)}%` : '-' },
    { title: '状态', dataIndex: 'status', render: renderStatus },
    { title: '创建时间', dataIndex: 'created_at' },
    { title: '操作', render: (_, r) => (
      <Link to={`/practice/detail/${r.id}`}>查看详情</Link>
    )},
  ];

  return <Table columns={columns} dataSource={data?.items} loading={loading} />;
}
```

### Step 2: 掌握度 Tab

**文件**: `admin-web/src/pages/Student/StudentDetail/views/MasteryView.tsx`（新建）

```tsx
export function MasteryView({ studentId }: { studentId: number }) {
  const { data: masteries } = useRequest(
    () => apiClient.get(`/api/admin/student/${studentId}/mastery`)
  );
  const { data: summary } = useRequest(
    () => apiClient.get(`/api/admin/student/${studentId}/mastery/summary`)
  );

  return (
    <div>
      {/* 摘要卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={6}><Statistic title="已练习能力点" value={summary?.practiced_count} /></Col>
        <Col span={6}><Statistic title="平均掌握度" value={summary?.avg_mastery} suffix="%" /></Col>
        <Col span={6}><Statistic title="薄弱项" value={summary?.weak_count} valueStyle={{ color: 'orange' }} /></Col>
        <Col span={6}><Statistic title="熟练项" value={summary?.strong_count} valueStyle={{ color: 'green' }} /></Col>
      </Row>

      {/* 能力掌握度列表 */}
      <Table 
        dataSource={masteries}
        columns={[
          { title: '能力点', dataIndex: 'ability_name' },
          { title: '正确率', dataIndex: 'correct_rate', render: v => `${v}%` },
          { title: '练习次数', dataIndex: 'practice_count' },
          { title: '掌握等级', dataIndex: 'mastery_level', render: renderMasteryLevel },
          { title: '最近练习', dataIndex: 'updated_at' },
        ]}
      />
    </div>
  );
}
```

### Step 3: 学生详情页路由集成

**文件**: `admin-web/src/pages/Student/StudentDetail/views/Main.tsx`

在 Tabs 中新增掌握度 tab：

```tsx
<Tabs items={[
  { key: 'basic', label: '基本信息', children: <BasicInfo /> },
  { key: 'practice', label: '练习记录', children: <PracticeList studentId={id} /> },
  { key: 'mastery', label: '掌握度', children: <MasteryView studentId={id} /> },
]} />
```

### Step 4: 管理端掌握度查询接口（新增）

当前后端**没有**提供以下接口，需要完整新增：

- `GET /api/admin/student/{id}/mastery` — 学生掌握度列表
- `GET /api/admin/student/{id}/mastery/summary` — 掌握度汇总

#### 4.1 数据模型

**文件**: `server-go/internal/mastery/model.go`（若尚未存在则新建）

```go
package mastery

import "time"

// MasteryRecord 表示学生对某个能力点的掌握度记录
type MasteryRecord struct {
    ID           int64     `json:"id"`
    StudentID    int64     `json:"student_id"`
    AbilityID    int64     `json:"ability_id"`
    AbilityName  string    `json:"ability_name"`
    CorrectRate  float64   `json:"correct_rate"`  // 0-100
    PracticeCount int      `json:"practice_count"`
    MasteryLevel string    `json:"mastery_level"` // weak/normal/good/excellent
    UpdatedAt    time.Time `json:"updated_at"`
}

// MasterySummary 掌握度汇总
type MasterySummary struct {
    PracticedCount int     `json:"practiced_count"`
    AvgMastery     float64 `json:"avg_mastery"`
    WeakCount      int     `json:"weak_count"`
    StrongCount    int     `json:"strong_count"`
}

// MasteryFilter 掌握度查询过滤条件
type MasteryFilter struct {
    AbilityID int64
    Level     string
    Page      int
    Size      int
}
```

#### 4.2 仓储层

**文件**: `server-go/internal/mastery/repository.go`（新建）

```go
package mastery

import (
    "context"
    "database/sql"
    "fmt"
)

type Repository struct {
    db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
    return &Repository{db: db}
}

// ListMastery 查询学生的能力掌握度列表
func (r *Repository) ListMastery(ctx context.Context, studentID int64, filter MasteryFilter) ([]MasteryRecord, error) {
    query := `
        SELECT ma.id, ma.student_id, ma.ability_id, a.name AS ability_name,
               ma.correct_rate, ma.practice_count, ma.mastery_level, ma.updated_at
        FROM ah_mastery ma
        JOIN ah_ability a ON a.id = ma.ability_id
        WHERE ma.student_id = ?
    `
    args := []interface{}{studentID}

    if filter.AbilityID > 0 {
        query += " AND ma.ability_id = ?"
        args = append(args, filter.AbilityID)
    }
    if filter.Level != "" {
        query += " AND ma.mastery_level = ?"
        args = append(args, filter.Level)
    }

    query += " ORDER BY ma.updated_at DESC"

    if filter.Size > 0 {
        query += fmt.Sprintf(" LIMIT %d", filter.Size)
        if filter.Page > 0 {
            query += fmt.Sprintf(" OFFSET %d", (filter.Page-1)*filter.Size)
        }
    }

    rows, err := r.db.QueryContext(ctx, query, args...)
    if err != nil {
        return nil, fmt.Errorf("查询掌握度列表失败: %w", err)
    }
    defer rows.Close()

    var records []MasteryRecord
    for rows.Next() {
        var rec MasteryRecord
        if err := rows.Scan(&rec.ID, &rec.StudentID, &rec.AbilityID, &rec.AbilityName,
            &rec.CorrectRate, &rec.PracticeCount, &rec.MasteryLevel, &rec.UpdatedAt); err != nil {
            return nil, fmt.Errorf("扫描掌握度记录失败: %w", err)
        }
        records = append(records, rec)
    }
    return records, rows.Err()
}

// GetMasterySummary 查询学生掌握度汇总
func (r *Repository) GetMasterySummary(ctx context.Context, studentID int64) (*MasterySummary, error) {
    query := `
        SELECT
            COUNT(*) AS practiced_count,
            COALESCE(AVG(correct_rate), 0) AS avg_mastery,
            SUM(CASE WHEN mastery_level = 'weak' THEN 1 ELSE 0 END) AS weak_count,
            SUM(CASE WHEN mastery_level IN ('good', 'excellent') THEN 1 ELSE 0 END) AS strong_count
        FROM ah_mastery
        WHERE student_id = ?
    `
    var summary MasterySummary
    err := r.db.QueryRowContext(ctx, query, studentID).Scan(
        &summary.PracticedCount, &summary.AvgMastery,
        &summary.WeakCount, &summary.StrongCount,
    )
    if err != nil {
        return nil, fmt.Errorf("查询掌握度汇总失败: %w", err)
    }
    return &summary, nil
}
```

#### 4.3 服务层

**文件**: `server-go/internal/mastery/service.go`（新建）

```go
package mastery

import "context"

type Service struct {
    repo *Repository
}

func NewService(repo *Repository) *Service {
    return &Service{repo: repo}
}

func (s *Service) ListMastery(ctx context.Context, studentID int64, filter MasteryFilter) ([]MasteryRecord, error) {
    return s.repo.ListMastery(ctx, studentID, filter)
}

func (s *Service) GetMasterySummary(ctx context.Context, studentID int64) (*MasterySummary, error) {
    return s.repo.GetMasterySummary(ctx, studentID)
}
```

#### 4.4 Handler 层

**文件**: `server-go/internal/student/admin_handlers.go`

```go
type AdminHandler struct {
    masteryService *mastery.Service
}

func NewAdminHandler(masteryService *mastery.Service) *AdminHandler {
    return &AdminHandler{masteryService: masteryService}
}

// GetStudentMastery 获取学生掌握度列表
func (h *AdminHandler) GetStudentMastery(w http.ResponseWriter, r *http.Request) {
    id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
    if err != nil {
        response.Error(w, fmt.Errorf("无效的学生 ID"))
        return
    }

    masteries, err := h.masteryService.ListMastery(r.Context(), id, mastery.MasteryFilter{})
    if err != nil {
        response.Error(w, err)
        return
    }
    response.Success(w, masteries)
}

// GetStudentMasterySummary 获取学生掌握度汇总
func (h *AdminHandler) GetStudentMasterySummary(w http.ResponseWriter, r *http.Request) {
    id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
    if err != nil {
        response.Error(w, fmt.Errorf("无效的学生 ID"))
        return
    }

    summary, err := h.masteryService.GetMasterySummary(r.Context(), id)
    if err != nil {
        response.Error(w, err)
        return
    }
    response.Success(w, summary)
}
```

#### 4.5 路由注册

**文件**: `server-go/cmd/server/main.go`（或路由注册入口）

在路由注册函数中添加：

```go
// 初始化掌握度模块
masteryRepo := mastery.NewRepository(db)
masteryService := mastery.NewService(masteryRepo)
adminHandler := student.NewAdminHandler(masteryService)

// 注册管理端掌握度接口
mux.HandleFunc("GET /api/admin/student/{id}/mastery", adminHandler.GetStudentMastery)
mux.HandleFunc("GET /api/admin/student/{id}/mastery/summary", adminHandler.GetStudentMasterySummary)
```

---

## 验收标准

1. 管理端学生详情页可查看练习记录列表
2. 新增"掌握度" Tab，展示各能力点的掌握等级和正确率
3. 统计摘要卡片展示关键数据
4. 可从练习列表跳转到练习详情查看完整报告
