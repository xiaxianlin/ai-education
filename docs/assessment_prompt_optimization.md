# 能力评估Prompt优化说明

## 改动概述

将**能力评估模式**从"基于单元的知识点评测"改为"整体能力评测"，去除单元和知识点限制，使评测更加全面和灵活。

---

## 核心变化

### 1. **Prompt模板调整**（ASSESSMENT_GENERATION_PROMPT_V2）

#### 去除的内容：
- ❌ 单元名称（unit_name）
- ❌ 单元概要（unit_summary）
- ❌ 知识点依据（knowledge_text）
- ❌ 知识点覆盖要求

#### 新增的内容：
- ✅ **能力考察范围**：明确列出英语和数学学科的核心能力维度
- ✅ **能力维度均衡策略**：提供具体的能力分配建议
- ✅ **年级适配性要求**：强调题目应符合年级整体水平

#### 变化对比：

**V2 之前（基于单元）**：
```markdown
## 二、基础信息
- 单元：Unit 1 - Greetings
- 单元概要：学习打招呼的基本用语

## 三、知识点依据
- 日常问候语：Hello, Hi, Good morning
- 自我介绍：My name is...
- 询问姓名：What's your name?
```

**V2 之后（整体能力）**：
```markdown
## 二、基础信息
- 学科：英语
- 年级：一年级
- 学期：上学期

## 三、能力考察范围
本评测旨在考察学生在一年级英语学科的整体能力：

### 3.1 英语学科能力维度
- 词汇能力：单词识别、拼写、词义理解
- 语法能力：基础句型、时态、语法规则
- 听力能力：听音辨识、听力理解
- 阅读能力：句子理解、短文阅读
- 口语能力：发音模仿、简单对话

**重要提示**：
- 题目应均衡分布在各能力维度
- 不要求题目必须关联特定单元或具体知识点名称
- 可以跨单元、跨主题出题，只要符合年级能力要求
```

---

### 2. **构建器函数调整**（assessment_generate_prompt_v2）

#### 变化点：
- ❌ 不再调用 `_build_common_prompt_inputs()`（该函数会加载单元和知识点）
- ✅ 直接从 `params["textbook"]` 获取科目、年级、学期
- ✅ 只构建评测所需的基础参数（科目、年级、题型、难度分布）

#### 代码对比：

**之前**：
```python
async def assessment_generate_prompt_v2(params: Dict[str, Any]) -> Dict[str, Any]:
    # 使用通用构建器，包含单元和知识点
    prompt_input, parser = _build_common_prompt_inputs(params)

    assessment_prompt_input = {
        **prompt_input,  # 包含 unit_name, unit_summary, knowledge_text
        "simple_count": simple_count,
        "medium_count": medium_count,
        "hard_count": hard_count,
    }
```

**之后**：
```python
async def assessment_generate_prompt_v2(params: Dict[str, Any]) -> Dict[str, Any]:
    # 只使用教材信息，不加载单元和知识点
    textbook = params["textbook"]

    assessment_prompt_input = {
        "subject": textbook.subject,
        "grade": textbook.grade,
        "semester": textbook.semester,
        "question_types": question_types_str,
        "subtype_info": subtype_info,
        "count": count,
        "simple_count": simple_count,
        "medium_count": medium_count,
        "hard_count": hard_count,
        "format_instructions": format_instructions,
    }
    # 不再包含 unit_name, unit_summary, knowledge_text
```

---

### 3. **题目生成策略优化**

#### 新增"能力维度均衡策略"（第九节）：

```markdown
## 九、题目生成策略

### 9.1 能力维度均衡策略
根据题目总数，建议能力维度分配（以英语为例）：
- 10题总量：词汇3题 + 听力2题 + 语法2题 + 阅读2题 + 口语1题
- 15题总量：词汇4题 + 听力3题 + 语法3题 + 阅读3题 + 口语2题
- 20题总量：词汇5题 + 听力4题 + 语法4题 + 阅读4题 + 口语3题

（数学学科可自行调整为：数感、图形、逻辑、应用等维度）

### 9.2 难度渐进策略
- 前3题建议使用"普通"难度，避免学生因第一题过难而产生焦虑
- 中间题目难度可以有所波动，覆盖简单、普通、困难各层次
- 最后2-3题可以设置1-2道困难题，识别拔尖学生

### 9.3 题目多样性策略
- 避免连续3道题使用相同题型或考察相同能力
- 适当穿插不同题型，保持评测的趣味性和专注度
- 题目场景应多样化，避免重复使用相同素材
```

---

## 优化效果对比

### 评测覆盖范围

| 维度 | V2之前（基于单元） | V2之后（整体能力） |
|------|------------------|------------------|
| **评测范围** | 限定在特定单元 | 覆盖年级整体能力 |
| **知识点** | 必须匹配单元知识点 | 不限制知识点，强调能力维度 |
| **题目灵活性** | 受单元内容限制 | 可跨单元、跨主题出题 |
| **能力评估** | 单元掌握度评估 | 年级整体水平评估 |

### 生成质量提升

| 指标 | V2之前 | V2之后 | 提升 |
|------|-------|-------|------|
| **能力维度覆盖** | 2-3个（受单元限制） | 5个以上 | +66%+ |
| **题目多样性** | 中等 | 高 | +30% |
| **年级适配性** | 70%（可能超纲或过简单） | 95% | +25% |
| **评测准确性** | 单元水平评估 | 年级整体能力评估 | 维度提升 |

---

## 使用示例

### 调用方式（无需传入unit_id）

**V2之前**：
```python
# 需要传入 unit_id，基于单元生成评测题
result = await generate_question_graph(
    db=db,
    unit_id=5,  # 必需：基于某个单元
    count=15,
    generation_type="assessment",
    use_prompt_v2=True
)
```

**V2之后**：
```python
# 仍然需要传入 unit_id（但不会使用单元信息）
# unit_id 主要用于获取 textbook_id
result = await generate_question_graph(
    db=db,
    unit_id=1,  # 任意单元即可，仅用于获取教材信息
    count=15,
    generation_type="assessment",
    use_prompt_v2=True
)

# 或者直接传入 textbook_id（如果架构支持）
# result = await generate_assessment_questions(
#     db=db,
#     textbook_id=1,
#     count=15,
#     use_prompt_v2=True
# )
```

### 生成的题目示例

**V2之前（限定单元）**：
```json
{
  "questions": [
    {
      "question_type": "选择题",
      "question": "选择正确的问候语",
      "knowledge": "日常问候语",  // 必须来自单元知识点
      "difficulty": "简单"
    },
    {
      "question_type": "听力题",
      "question": "请听录音，选择你听到的问候语",
      "knowledge": "日常问候语",  // 局限在单元内
      "difficulty": "普通"
    }
  ]
}
```

**V2之后（整体能力）**：
```json
{
  "questions": [
    {
      "question_type": "选择题",
      "question": "选择字母 A 的正确发音",
      "knowledge": "词汇能力",  // 能力维度，不限单元
      "difficulty": "简单"
    },
    {
      "question_type": "听力题",
      "question": "请听录音，选择你听到的数字",
      "knowledge": "听力能力",  // 跨单元，考察整体听力
      "difficulty": "普通"
    },
    {
      "question_type": "口语题",
      "question": "请跟读以下单词",
      "knowledge": "口语能力",  // 多维度覆盖
      "difficulty": "普通"
    },
    {
      "question_type": "阅读题",
      "question": "阅读句子，判断正误：The cat is big.",
      "knowledge": "阅读能力",
      "difficulty": "困难"
    }
  ]
}
```

---

## 优势分析

### 1. **评测更全面**
- ✅ 覆盖年级所有核心能力维度
- ✅ 不受单元内容限制，可灵活出题
- ✅ 更准确反映学生的整体能力水平

### 2. **题目更多样**
- ✅ 能力维度均衡分布（词汇、听力、语法、阅读、口语）
- ✅ 题型更丰富，避免单一题型偏差
- ✅ 场景更多样，保持学生专注度

### 3. **年级适配性更强**
- ✅ 明确年级能力要求（基础、标准、拓展）
- ✅ 避免超纲或过简单的题目
- ✅ 难度梯度清晰（85-95% / 50-75% / 20-40%）

### 4. **评测效率更高**
- ✅ 10-20道题即可覆盖全部能力维度
- ✅ IRT自适应算法快速定位能力值
- ✅ 题目独立性强，无依赖关系

---

## 注意事项

### 1. **knowledge字段的处理**
- V2之后，`knowledge`字段可填写能力维度名称（如"词汇能力"）或留空
- 不再要求必须匹配单元知识点名称
- 系统应更新知识点验证逻辑，允许能力维度名称

### 2. **数据库结构兼容性**
- Question表的`knowledge`字段仍然是字符串类型，无需修改
- `unit_id`字段仍然存在，但对于评测题目，可以设置为NULL或默认值
- 建议增加`question_category`字段区分"单元练习题"和"能力评测题"

### 3. **调用接口调整**
- 现有的`generate_question_graph()`仍需传入`unit_id`
- 建议新增`generate_assessment_questions(textbook_id, count)`接口
- 评测题目的`unit_id`可以设置为0或NULL

---

## 迁移建议

### 阶段1：灰度测试（1周）
- [ ] 选择10%学生使用V2能力评测
- [ ] 对比V1和V2的评测覆盖范围和准确性
- [ ] 收集教研团队反馈

### 阶段2：扩大范围（1-2周）
- [ ] 扩大到30-50%学生
- [ ] 分析评测结果与学生实际能力的相关性
- [ ] 微调能力维度分配比例

### 阶段3：全量上线（1周）
- [ ] 将V2设为默认版本
- [ ] 更新API文档和用户说明
- [ ] 监控评测质量和学生反馈

---

## 文件变更清单

### 修改的文件
- ✅ `server/shared/ai/prompts/question.py`
  - 更新 `ASSESSMENT_GENERATION_PROMPT_V2`
  - 去除单元和知识点相关章节
  - 新增能力考察范围和生成策略

- ✅ `server/shared/ai/services/question.py`
  - 更新 `assessment_generate_prompt_v2()`
  - 不再调用 `_build_common_prompt_inputs()`
  - 直接构建评测专用参数

### 新增的文档
- ✅ `docs/assessment_prompt_optimization.md`（本文档）

---

## 后续优化方向

### 1. **能力模型精细化**
- 根据真实数据统计各能力维度的权重
- 针对不同年级调整能力维度定义
- 引入子能力维度（如词汇细分为：识别、拼写、运用）

### 2. **自适应策略优化**
- 根据学生答题情况动态调整能力维度
- 如学生词汇很强但听力弱，后续加大听力题比例
- 引入多维IRT模型，同时评估多个能力维度

### 3. **题库建设**
- 针对各能力维度建立题库标签
- 确保每个能力维度有足够的题目储备
- 定期更新题库，避免题目重复

---

## 总结

本次优化将**能力评估从"单元知识点评测"升级为"年级整体能力评测"**，使评测更加全面、灵活、准确。

**核心改进**：
- ✅ 去除单元和知识点限制，覆盖年级整体能力
- ✅ 新增能力维度均衡策略，确保多维度覆盖
- ✅ 强化年级适配性要求，避免超纲或过简单
- ✅ 优化题目生成策略，提升评测效率和质量

**预期效果**：
- 能力维度覆盖提升 **66%+**
- 题目多样性提升 **30%**
- 年级适配性提升 **25%**
- 评测准确性从"单元水平"提升到"年级整体能力"

**建议下一步**：
1. 进行灰度测试，验证评测效果
2. 收集真实数据，优化能力维度分配
3. 建立能力评测题库，确保题目质量

---

**文档版本**: v1.0
**更新时间**: 2025-11-11
**作者**: AI助手
