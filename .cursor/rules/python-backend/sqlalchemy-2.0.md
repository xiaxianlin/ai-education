---
description: "SQLAlchemy 2.0 ORM 风格规范 - 所有 SQLAlchemy 代码必须严格遵循 2.0 版本 ORM 风格"
globs:
  - "apps/server/**/*.py"
alwaysApply: false
---

# SQLAlchemy 2.0 ORM 风格规范

**强制要求**: 所有 SQLAlchemy 相关代码必须使用 2.0 版本的 ORM 风格，禁止使用 1.x 版本的旧式 API。

## 核心原则

1. **使用 `Mapped` 类型注解**: 所有模型字段必须使用 `Mapped[Type]` 类型注解
2. **使用 `mapped_column()`**: 所有列定义必须使用 `mapped_column()` 而非 `Column()`
3. **使用 `select()` 语句**: 所有查询必须使用 `select()` 而非 `session.query()`
4. **使用 `DeclarativeBase`**: 基类必须继承自 `DeclarativeBase`
5. **异步优先**: 所有数据库操作必须使用 `AsyncSession` 和 `async/await`

## 模型定义规范

### ✅ 正确：SQLAlchemy 2.0 风格

```python
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from sqlalchemy import String, Text, Integer

class Base(DeclarativeBase):
    pass

class Student(Base):
    __tablename__ = "ah_student"
    
    # 使用 Mapped 类型注解
    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    grade: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[int] = mapped_column(default=0)
    
    # 可选字段使用 Mapped[Type | None]
    token: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    
    # 关系定义
    textbooks: Mapped[list["StudentTextbook"]] = relationship(
        "StudentTextbook",
        lazy="selectin",  # 使用 2.0 风格的加载策略
    )
```

### ❌ 错误：SQLAlchemy 1.x 风格（禁止使用）

```python
# ❌ 禁止：使用 Column() 而非 mapped_column()
from sqlalchemy import Column, String, Integer

class Student(Base):
    __tablename__ = "ah_student"
    id = Column(String(255), primary_key=True)  # ❌ 错误
    
# ❌ 禁止：没有类型注解
class Student(Base):
    __tablename__ = "ah_student"
    name = mapped_column(String(255))  # ❌ 缺少 Mapped 类型注解
```

## 查询操作规范

### ✅ 正确：使用 `select()` 语句

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# 单条记录查询
async def get_student(db: AsyncSession, student_id: str):
    student = await db.scalar(
        select(Student).where(Student.id == student_id)
    )
    return student

# 多条记录查询
async def list_students(db: AsyncSession, grade: int):
    result = await db.scalars(
        select(Student)
        .where(Student.grade == grade)
        .order_by(Student.create_time.desc())
        .limit(10)
    )
    return result.all()

# 计数查询
async def count_students(db: AsyncSession, grade: int):
    count = await db.scalar(
        select(func.count(Student.id)).where(Student.grade == grade)
    )
    return count or 0
```

### ❌ 错误：使用旧式 `query()` API（禁止使用）

```python
# ❌ 禁止：使用 session.query()
student = await db.query(Student).filter(Student.id == student_id).first()

# ❌ 禁止：同步风格的查询
student = db.query(Student).filter_by(id=student_id).first()
```

## 关联查询规范

### ✅ 正确：使用 `selectinload` / `joinedload` / `noload`

```python
from sqlalchemy.orm import selectinload, joinedload, noload

# Eager loading - 使用 selectinload（推荐用于一对多）
student = await db.scalar(
    select(Student)
    .options(selectinload(Student.textbooks))
    .where(Student.id == student_id)
)

# Eager loading - 使用 joinedload（推荐用于多对一）
question = await db.scalar(
    select(Question)
    .options(joinedload(Question.question_type))
    .where(Question.id == question_id)
)

# 明确禁用关联加载
student = await db.scalar(
    select(Student)
    .options(noload(Student.textbooks))
    .where(Student.id == student_id)
)
```

### ❌ 错误：使用旧式 `joinedload()` 语法（部分禁止）

```python
# ⚠️ 不推荐：虽然可以工作，但不是最佳实践
from sqlalchemy.orm import joinedload

# 应该使用 select() + options() 的组合
```

## 插入和更新操作规范

### ✅ 正确：使用 `db.add()` 和 `db.add_all()`

```python
async def create_student(db: AsyncSession, params: CreateStudentSchema):
    student = Student(
        id=str(uuid.uuid4()),
        name=params.name,
        phone=params.phone,
        grade=params.grade,
    )
    db.add(student)
    await db.flush()  # 如果需要获取 ID 但不提交
    await db.commit()
    await db.refresh(student)  # 刷新以获取数据库生成的字段
    return student

async def create_multiple(db: AsyncSession, students: list[Student]):
    db.add_all(students)
    await db.commit()
```

### ✅ 正确：更新操作

```python
async def update_student(db: AsyncSession, student_id: str, params: UpdateStudentSchema):
    # 先查询对象
    student = await db.scalar(select(Student).where(Student.id == student_id))
    if not student:
        raise ValueError("学生不存在")
    
    # 更新字段
    for field, value in params.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    
    await db.commit()
    await db.refresh(student)
    return student
```

### ❌ 错误：使用旧式更新方法（禁止使用）

```python
# ❌ 禁止：使用 merge()
student = db.merge(student)

# ❌ 禁止：使用 update() 方法（虽然可以，但不推荐用于 ORM 风格）
await db.execute(update(Student).where(Student.id == id).values(name="new"))
```

## 删除操作规范

### ✅ 正确：使用 `db.delete()` 或直接删除对象

```python
# 方式1：先查询再删除（推荐，可以检查是否存在）
async def delete_student(db: AsyncSession, student_id: str):
    student = await db.scalar(select(Student).where(Student.id == student_id))
    if not student:
        raise ValueError("学生不存在")
    await db.delete(student)
    await db.commit()

# 方式2：使用 delete() 语句（批量删除）
async def delete_by_grade(db: AsyncSession, grade: int):
    await db.execute(delete(Student).where(Student.grade == grade))
    await db.commit()
```

## 事务管理规范

### ✅ 正确：使用 `async with` 或依赖注入

```python
# 方式1：使用依赖注入（推荐用于路由）
from fastapi import Depends
from shared.core.database import Database

@router.post("/")
async def create_student(
    params: CreateStudentSchema,
    db: AsyncSession = Database  # 自动管理事务
):
    return await service.create_student(db, params)

# 方式2：手动管理会话
async def some_function():
    async with AsyncSessionLocal() as db:
        try:
            # 数据库操作
            await db.commit()
        except Exception:
            await db.rollback()
            raise
```

## 关系定义规范

### ✅ 正确：使用 `Mapped` 类型注解关系

```python
class Student(Base):
    __tablename__ = "ah_student"
    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    
    # 一对多关系
    textbooks: Mapped[list["StudentTextbook"]] = relationship(
        "StudentTextbook",
        back_populates="student",
        lazy="selectin",
    )

class StudentTextbook(Base):
    __tablename__ = "ah_student_textbook"
    student_id: Mapped[str] = mapped_column(String(255), ForeignKey("ah_student.id"))
    
    # 多对一关系
    student: Mapped["Student"] = relationship(
        "Student",
        back_populates="textbooks",
        lazy="joined",
    )
    
    # 多对一关系（可选）
    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        lazy="joined",
    )
```

### ❌ 错误：旧式关系定义（禁止使用）

```python
# ❌ 禁止：没有类型注解的关系
class Student(Base):
    textbooks = relationship("StudentTextbook")  # ❌ 缺少 Mapped 类型注解
```

## 加载策略说明

SQLAlchemy 2.0 推荐的加载策略：

- **`selectinload`**: 用于一对多关系，使用单独的 SELECT IN 查询
- **`joinedload`**: 用于多对一关系，使用 JOIN 查询
- **`noload`**: 明确禁用关联加载
- **`lazy="selectin"`**: 在关系定义中设置默认加载策略（2.0 风格）

## 常见错误检查清单

- [ ] 所有模型字段是否使用了 `Mapped[Type]` 类型注解？
- [ ] 是否使用了 `mapped_column()` 而非 `Column()`？
- [ ] 所有查询是否使用了 `select()` 而非 `query()`？
- [ ] 是否使用了 `AsyncSession` 和 `async/await`？
- [ ] 关系定义是否使用了 `Mapped` 类型注解？
- [ ] 是否使用了 `DeclarativeBase` 作为基类？
- [ ] 是否避免了使用 `session.query()` 等旧式 API？

## 参考资源

- [SQLAlchemy 2.0 Migration Guide](https://docs.sqlalchemy.org/en/20/changelog/migration_20.html)
- [SQLAlchemy 2.0 ORM Quickstart](https://docs.sqlalchemy.org/en/20/orm/quickstart.html)
- [SQLAlchemy 2.0 Typing](https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html)

