# 后端集成指南

## FastAPI 后端集成

### 1. 安装依赖

```bash
cd server
uv add --dev @ai-edu/shared-types
```

### 2. 更新项目结构

```python
# server/types/__init__.py
"""
类型定义模块
"""
import sys
import os
from pathlib import Path

# 添加共享类型路径
shared_types_path = Path(__file__).parent.parent.parent / "shared-types" / "build" / "python"
sys.path.insert(0, str(shared_types_path))

try:
    from models import (
        Student, Admin, Textbook, Unit, Knowledge, Question,
        PracticeSession, PracticeAnswer, PracticeReport, WrongRecord,
        # 其他需要的类型...
    )
    print("✅ 共享类型导入成功")
except ImportError as e:
    print(f"❌ 共享类型导入失败: {e}")
    print("请先运行: cd shared-types && npm run build")

__all__ = [
    'Student', 'Admin', 'Textbook', 'Unit', 'Knowledge', 'Question',
    'PracticeSession', 'PracticeAnswer', 'PracticeReport', 'WrongRecord'
]
```

### 3. 更新 API 路由

```python
# server/student/routes/student.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.core.database import get_db
from server.student.services.student import StudentService
from server.types import Student, StudentLoginRequest, LoginResponse, ApiResponse

router = APIRouter(prefix="/student", tags=["student"])

@router.post("/login", response_model=ApiResponse[LoginResponse])
async def login(
    request: StudentLoginRequest,
    db: Session = Depends(get_db)
):
    """学生登录"""
    try:
        service = StudentService(db)
        result = await service.login(request.phone, request.password)

        return ApiResponse(
            code=0,
            message="登录成功",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile", response_model=ApiResponse[Student])
async def get_profile(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """获取学生信息"""
    return ApiResponse(
        code=0,
        message="success",
        data=current_student
    )
```

### 4. 更新服务层

```python
# server/student/services/student.py
from sqlalchemy.orm import Session
from server.types import Student, StudentLoginRequest, LoginResponse
from server.shared.auth import create_access_token, verify_password

class StudentService:
    def __init__(self, db: Session):
        self.db = db

    async def login(self, phone: str, password: str) -> LoginResponse:
        """学生登录"""
        # 查询学生
        student = self.db.query(Student).filter(Student.phone == phone).first()
        if not student or not verify_password(password, student.password_hash):
            raise HTTPException(status_code=401, detail="手机号或密码错误")

        # 生成 token
        token = create_access_token(data={"sub": student.id, "type": "student"})

        return LoginResponse(
            token=token,
            student=student
        )
```

### 5. 更新数据库模型

```python
# server/core/models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from server.types import Student as StudentSchema

Base = declarative_base()

class StudentDB(Base):
    __tablename__ = "students"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    grade = Column(Integer, nullable=False)
    status = Column(Integer, default=1)
    password_hash = Column(String(255))
    create_time = Column(Integer, nullable=False)
    update_time = Column(Integer)

    def to_schema(self) -> StudentSchema:
        """转换为共享类型 Schema"""
        return StudentSchema(
            id=self.id,
            name=self.name,
            phone=self.phone,
            grade=self.grade,
            status=self.status,
            create_time=self.create_time,
            update_time=self.update_time
        )

    @classmethod
    def from_schema(cls, schema: StudentSchema) -> "StudentDB":
        """从共享类型 Schema 创建"""
        return cls(
            id=schema.id,
            name=schema.name,
            phone=schema.phone,
            grade=schema.grade,
            status=schema.status,
            create_time=schema.create_time,
            update_time=schema.update_time
        )
```

### 6. 更新依赖项

```python
# server/shared/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from server.core.database import get_db
from server.types import Student, Admin

security = HTTPBearer()

async def get_current_student(
    token: str = Depends(security),
    db: Session = Depends(get_db)
) -> Student:
    """获取当前登录学生"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        user_type: str = payload.get("type")

        if user_id is None or user_type != "student":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # 查询学生信息
    student = db.query(StudentDB).filter(StudentDB.id == user_id).first()
    if student is None:
        raise credentials_exception

    return student.to_schema()
```

## 数据库同步工具

### 1. 创建同步脚本

```python
# server/scripts/sync_types.py
"""
同步共享类型到数据库模型
"""
import os
import sys
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from server.types import *  # 导入所有共享类型
from sqlalchemy import create_engine, MetaData, Table, Column
from sqlalchemy.types import Integer, String, DateTime, Boolean, Text

def sync_types_to_db():
    """同步类型定义到数据库表结构"""

    # 数据库连接
    engine = create_engine(DATABASE_URL)
    metadata = MetaData()

    # 创建学生表
    students_table = Table(
        'students',
        metadata,
        Column('id', String(50), primary_key=True),
        Column('name', String(100), nullable=False),
        Column('phone', String(20), unique=True, nullable=False),
        Column('grade', Integer, nullable=False),
        Column('status', Integer, default=1),
        Column('password_hash', String(255)),
        Column('create_time', Integer, nullable=False),
        Column('update_time', Integer),
    )

    # 创建教材表
    textbooks_table = Table(
        'textbooks',
        metadata,
        Column('id', Integer, primary_key=True),
        Column('subject', String(50), nullable=False),
        Column('version', String(100), nullable=False),
        Column('grade', Integer, nullable=False),
        Column('semester', String(20), nullable=False),
        Column('file', String(255)),
        Column('index_file_id', String(100)),
        Column('is_parsed', Boolean, default=False),
        Column('active', Boolean, default=True),
        Column('create_time', Integer, nullable=False),
        Column('update_time', Integer),
    )

    # 创建题目表
    questions_table = Table(
        'questions',
        metadata,
        Column('id', Integer, primary_key=True),
        Column('type', String(50), nullable=False),
        Column('subtype', String(50)),
        Column('subject', String(50), nullable=False),
        Column('grade', Integer, nullable=False),
        Column('content', Text, nullable=False),
        Column('options', Text),
        Column('answer', String(1000)),
        Column('resource', String(255)),
        Column('resource_type', String(20)),
        Column('difficulty', String(20)),
        Column('textbook_id', Integer, nullable=False),
        Column('unit_id', Integer),
        Column('knowledge_ids', String(500)),  # JSON string
        Column('create_time', Integer, nullable=False),
        Column('update_time', Integer),
    )

    # 创建所有表
    metadata.create_all(engine)
    print("✅ 数据库表结构同步完成")

if __name__ == "__main__":
    sync_types_to_db()
```

### 2. 自动化构建流程

```bash
#!/bin/bash
# scripts/build-and-sync.sh

echo "🔨 构建共享类型..."
cd shared-types
npm run build

echo "📦 同步到后端..."
cd ../server
uv add --dev @ai-edu/shared-types

echo "🗄️ 同步数据库结构..."
uv run python server/scripts/sync_types.py

echo "✅ 构建和同步完成!"
```

## 测试集成

### 1. 单元测试

```python
# tests/test_types_integration.py
import pytest
from server.types import Student, Question, PracticeSession
from server.core.models import StudentDB

def test_student_schema_conversion():
    """测试学生类型转换"""
    # 创建共享类型实例
    student_schema = Student(
        id="123",
        name="张三",
        phone="13800138000",
        grade=5,
        status=1,
        create_time=1640995200
    )

    # 转换为数据库模型
    student_db = StudentDB.from_schema(student_schema)

    # 转换回共享类型
    result_schema = student_db.to_schema()

    assert result_schema.id == student_schema.id
    assert result_schema.name == student_schema.name
    assert result_schema.grade == student_schema.grade

def test_question_validation():
    """测试题目类型验证"""
    question = Question(
        id=1,
        type="选择题",
        subject="数学",
        grade=5,
        content="1 + 1 = ?",
        options=["2", "3", "4"],
        answer="2",
        textbook_id=1,
        create_time=1640995200
    )

    assert question.type == "选择题"
    assert len(question.options) == 4
    assert question.answer == "2"
```

### 2. API 测试

```python
# tests/test_api_integration.py
import pytest
from fastapi.testclient import TestClient
from server.main import app
from server.types import StudentLoginRequest

client = TestClient(app)

def test_student_login():
    """测试学生登录 API"""
    login_data = StudentLoginRequest(
        phone="13800138000",
        password="123456"
    )

    response = client.post("/api/student/login", json=login_data.dict())

    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert "token" in data["data"]
    assert "student" in data["data"]
```

## 部署配置

### 1. Docker 配置

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

# 复制共享类型
COPY ../shared-types/build/python /app/shared-types

# 安装依赖
COPY requirements.txt .
RUN pip install -r requirements.txt

# 复制应用代码
COPY . .

# 设置 Python 路径
ENV PYTHONPATH=/app/shared-types:$PYTHONPATH

CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "7890"]
```

### 2. CI/CD 配置

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Build shared types
        run: |
          cd shared-types
          npm install
          npm run build

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'

      - name: Test backend integration
        run: |
          cd server
          python -m pytest tests/

      - name: Deploy
        run: |
          # 部署脚本
```

## 最佳实践

### 1. 类型转换模式

```python
# 统一的类型转换模式
class BaseModelConverter:
    @classmethod
    def db_to_schema(cls, db_model):
        """数据库模型转 Schema"""
        pass

    @classmethod
    def schema_to_db(cls, schema):
        """Schema 转数据库模型"""
        pass

    @classmethod
    def dict_to_schema(cls, data: dict):
        """字典转 Schema"""
        pass
```

### 2. 错误处理

```python
# 统一的错误处理
from fastapi import HTTPException
from server.types import ApiResponse

def api_response(data=None, message="success", code=0):
    """统一 API 响应格式"""
    return ApiResponse(code=code, message=message, data=data)

def handle_error(func):
    """统一错误处理装饰器"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    return wrapper
```

### 3. 数据验证

```python
# 在服务层进行数据验证
from pydantic import ValidationError

def validate_student_data(data: dict) -> Student:
    """验证学生数据"""
    try:
        return Student(**data)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
```