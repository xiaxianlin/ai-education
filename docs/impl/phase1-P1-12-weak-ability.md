# P1-12 薄弱能力点识别与前端展示

> **优先级**: P1 | **预估工期**: 2天 | **前置依赖**: P1-11
> **状态**: 📋 待开发（后端接口已有，前端需完善）

---

## 现状分析

**后端已有**:
- `GET /api/student/mastery/weak` — 返回掌握度低于阈值的薄弱能力点
- `GET /api/student/mastery/list` — 返回所有能力点的掌握度
- `GET /api/student/mastery/summary` — 返回统计摘要

**前端缺失**:
- 首页 `AbilityAnalysisSection` 展示不够完善
- 没有独立的薄弱项分析页面
- 能力练习页没有高亮薄弱能力点

---

## 实现方案

### Step 1: 学生端首页薄弱项展示

**文件**: `apps/student-web/src/pages/Home/components/AbilityAnalysisSection.tsx`

增强现有组件，展示薄弱能力点：

```tsx
export function AbilityAnalysisSection() {
  const { data: weakList } = useRequest(
    () => apiClient.get('/api/student/mastery/weak', { threshold: 60, limit: 5 })
  );

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">能力分析</h3>
      
      {/* 薄弱项预警 */}
      {weakList?.length > 0 && (
        <div className="rounded-lg bg-orange-50 p-4">
          <h4 className="font-medium text-orange-700">需要加强的能力</h4>
          <div className="mt-2 space-y-2">
            {weakList.map(item => (
              <AbilityBar 
                key={item.ability_code}
                name={item.ability_name}
                rate={item.correct_rate}
                level={item.mastery_level}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* 快速练习入口 */}
      {weakList?.length > 0 && (
        <Link to={`/practice/ability?focus=weak`} className="text-blue-500 text-sm">
          针对薄弱项练习 →
        </Link>
      )}
    </div>
  );
}
```

### Step 2: 能力掌握度进度条组件

**文件**: `apps/student-web/src/pages/Home/components/AbilityBar.tsx`

```tsx
interface AbilityBarProps {
  name: string;
  rate: number;
  level: number;
}

function getLevelColor(level: number): string {
  const colors: Record<number, string> = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-blue-500',
    4: 'bg-green-500',
  };
  return colors[level] || 'bg-gray-300';
}

export function AbilityBar({ name, rate, level }: AbilityBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-24 truncate">{name}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full">
        <div className={`h-2 rounded-full ${getLevelColor(level)}`} 
             style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-10 text-right">{rate}%</span>
    </div>
  );
}
```

### Step 3: 能力练习页高亮薄弱项

**文件**: `apps/student-web/src/pages/PracticeAbility/components/AbilityPracticeCard.tsx`

```tsx
export function AbilityPracticeCard({ ability, mastery }) {
  const isWeak = mastery?.correct_rate < 60;

  return (
    <div className={`rounded-lg border p-4 ${isWeak ? 'border-orange-300 bg-orange-50' : ''}`}>
      <div className="flex justify-between items-center">
        <h4>{ability.name}</h4>
        {isWeak && <span className="text-xs text-orange-500">薄弱项</span>}
      </div>
      {mastery && (
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
          <div className="h-1.5 rounded-full bg-blue-500" 
               style={{ width: `${mastery.correct_rate}%` }} />
        </div>
      )}
    </div>
  );
}
```

### Step 4: 掌握度总览页面（可选）

**文件**: `apps/student-web/src/pages/Mastery/index.tsx`（新建页面）

展示所有能力点的掌握度矩阵（学科 × 能力 × 掌握等级）。

路由: `/mastery`

---

## 验收标准

1. 首页展示薄弱能力点列表，带进度条和掌握等级颜色
2. 能力练习页高亮标记薄弱项
3. 点击薄弱项可直接跳转针对性练习
4. 掌握度数据实时从后端获取
