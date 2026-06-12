# P1-19 题目管理完善（管理端搜索和编辑）

> **优先级**: P1 | **预估工期**: 2天 | **前置依赖**: 无
> **状态**: 🔧 开发中（后端接口已有，前端需完善）

---

## 现状分析

**后端已实现**:
- `GET /api/admin/question/search` — 分页搜索题目
- `GET /api/admin/question/{id}` — 获取题目详情
- `PATCH /api/admin/question/{id}` — 更新题目
- `DELETE /api/admin/question/{id}` — 删除题目

**前端已有**:
- `admin-web/src/pages/Question/QuestionList/` — 基础列表页
- `admin-web/src/pages/Question/api.ts` — API 调用

**缺失**: 搜索筛选条件不完整、编辑弹窗需完善、题目详情展示需改进

---

## 实现方案

### Step 1: 完善搜索筛选

**文件**: `admin-web/src/pages/Question/QuestionList/views/List.tsx`

在表格上方增加筛选条件：

```tsx
<Form layout="inline" className="mb-4">
  <Form.Item label="题型">
    <Select placeholder="全部题型" allowClear>
      <Option value="choice">选择题</Option>
      <Option value="judge">判断题</Option>
      <Option value="sorting">排序题</Option>
      <Option value="matching">匹配题</Option>
      <Option value="input">填空题</Option>
    </Select>
  </Form.Item>
  <Form.Item label="学科">
    <Select placeholder="全部学科" allowClear>
      <Option value="chinese">语文</Option>
      <Option value="math">数学</Option>
      <Option value="english">英语</Option>
    </Select>
  </Form.Item>
  <Form.Item label="练习ID">
    <Input placeholder="输入练习会话ID" />
  </Form.Item>
  <Form.Item>
    <Button type="primary" htmlType="submit">搜索</Button>
  </Form.Item>
</Form>
```

### Step 2: 题目编辑弹窗

**文件**: `admin-web/src/pages/Question/QuestionList/views/EditModal.tsx`（新建）

```tsx
interface EditModalProps {
  visible: boolean;
  question: Question;
  onClose: () => void;
  onSave: (q: Question) => void;
}

export function EditModal({ visible, question, onClose, onSave }: EditModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      content: JSON.stringify(question.content, null, 2),
      answer: JSON.stringify(question.answer, null, 2),
      explanation: question.explanation || '',
    });
  }, [question]);

  const handleSave = async () => {
    const values = await form.validateFields();

    let parsedContent: any;
    let parsedAnswer: any;
    try {
      parsedContent = JSON.parse(values.content);
    } catch {
      message.error('题目内容 JSON 格式错误，请检查后重试');
      return;
    }
    try {
      parsedAnswer = JSON.parse(values.answer);
    } catch {
      message.error('正确答案 JSON 格式错误，请检查后重试');
      return;
    }

    await apiClient.patch(`/api/admin/question/${question.id}`, {
      content: parsedContent,
      answer: parsedAnswer,
      explanation: values.explanation,
    });
    onSave(question);
  };

  return (
    <Modal title="编辑题目" open={visible} onOk={handleSave} onCancel={onClose} width={700}>
      <Form form={form} layout="vertical">
        <Form.Item label="题目内容 (JSON)" name="content" rules={[{ required: true }]}>
          <Input.TextArea rows={8} />
        </Form.Item>
        <Form.Item label="正确答案 (JSON)" name="answer" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label="解析" name="explanation">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

### Step 3: 题目详情展示优化

**文件**: `admin-web/src/pages/Question/QuestionList/views/Detail.tsx`

按题型渲染不同的题目展示：

```tsx
function renderQuestionContent(type: string, content: any) {
  switch (type) {
    case 'choice':
      return (
        <div>
          <p className="font-medium">{content.stem}</p>
          <div className="mt-2 space-y-1">
            {content.options?.map(opt => (
              <div key={opt.key} className={`p-2 rounded ${opt.key === content.correct ? 'bg-green-50' : ''}`}>
                {opt.key}. {opt.text}
              </div>
            ))}
          </div>
        </div>
      );
    case 'judge':
      return <p>{content.stem} (判断题)</p>;
    case 'input':
      return <p>{content.stem} (填空题)</p>;
    default:
      return <pre>{JSON.stringify(content, null, 2)}</pre>;
  }
}
```

---

## 验收标准

1. 管理端可按题型、学科、练习ID 筛选题目
2. 点击题目可查看详情（按题型正确渲染）
3. 可编辑题目内容、答案、解析
4. 可删除题目（带确认弹窗）
5. 分页正常工作
