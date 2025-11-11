# 问题库知识库系统设计（优化版）

## 一、概述

问题库知识库系统是为今日练习、单元练习、能力评测提供智能题目生成的基础系统。系统通过优化的SQL查询和基于单元掌握度的智能算法实现精准题目推荐，学习情况以单元为维度进行追踪，为个性化学习提供数据支持。

**设计原则**：保留核心价值，去除过度复杂，实现性价比最高的升级方案。

## 二、核心目标

1. **结构化知识点体系**：建立知识点与单元的两级结构（单元 -> 知识点）
2. **问题-知识点关联**：建立问题与知识点的多对多关系，支持一道题涉及多个知识点
3. **单元维度掌握度追踪**：以单元为维度追踪学生的学习情况
4. **智能题目生成**：基于单元掌握度、难度分布、学习进度等因素生成练习
5. **优化的SQL查询**：使用高效的数据库查询替代向量检索，降低系统复杂度

## 三、数据模型设计

### 3.1 知识点模型增强

#### 3.1.1 知识点模型（简化版，两级结构）

```python
class Knowledge(BaseModel):
    """知识点模型（简化版，保持两级结构：单元 -> 知识点）"""
    __tablename__ = "ah_knowledge"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    textbook_id: Mapped[int] = mapped_column(nullable=False, index=True)
    unit_id: Mapped[int] = mapped_column(nullable=False, index=True)
    
    # 知识点基本信息
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    
    # 知识点属性（简化）
    difficulty: Mapped[str] = mapped_column(String(50), nullable=True)  # 知识点难度（简单/普通/困难）
    importance: Mapped[int] = mapped_column(default=5)  # 重要性（1-10，10最重要）
    order: Mapped[int] = mapped_column(default=0)  # 同级知识点排序
    
    # ❌ 已删除：parent_id, level, prerequisite_ids
    # 理由：单元已经提供层级，避免过度复杂的三层嵌套
    # 如需层级关系，可通过单元内的order字段实现排序
    
    # ❌ 已删除：question_count（改为计算属性，避免冗余）
    # 使用 KnowledgeService.get_question_count() 方法通过缓存获取
    
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column()
    
    # 关联关系
    unit: Mapped["Unit"] = relationship(
        "Unit",
        primaryjoin="foreign(Knowledge.unit_id) == Unit.id",
        lazy="joined"
    )
    
    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(Knowledge.textbook_id) == Textbook.id",
        lazy="joined"
    )
```

#### 3.1.2 知识点关系表（多对多）

```python
class QuestionKnowledge(BaseModel):
    """问题-知识点关联表（多对多）"""
    __tablename__ = "ah_question_knowledge"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    question_id: Mapped[int] = mapped_column(nullable=False, index=True)
    knowledge_id: Mapped[int] = mapped_column(nullable=False, index=True)
    
    # 关联属性
    is_primary: Mapped[int] = mapped_column(default=1)  # 是否主要知识点（1-主要，0-次要）
    weight: Mapped[float] = mapped_column(default=1.0)  # 权重（0-1，用于计算掌握度）
    
    create_time: Mapped[int] = mapped_column(default=now)
    
    # 关联关系
    question: Mapped["Question"] = relationship(
        "Question",
        back_populates="knowledge_points"
    )
    knowledge: Mapped["Knowledge"] = relationship(
        "Knowledge",
        back_populates="questions"
    )
    
    # 唯一约束：同一问题不能重复关联同一知识点
    __table_args__ = (
        UniqueConstraint('question_id', 'knowledge_id', name='uq_question_knowledge'),
    )
```

#### 3.1.3 学生单元掌握度表（以单元为维度）

```python
class StudentUnitMastery(BaseModel):
    """学生单元掌握度表（以单元为维度）"""
    __tablename__ = "ah_student_unit_mastery"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    unit_id: Mapped[int] = mapped_column(nullable=False, index=True)
    textbook_id: Mapped[int] = mapped_column(nullable=False, index=True)
    
    # 掌握度指标
    mastery_level: Mapped[float] = mapped_column(default=0.0)  # 掌握度（0-1）
    mastery_score: Mapped[float] = mapped_column(default=0.0)  # 掌握分数（0-100）
    
    # 统计信息
    total_practiced: Mapped[int] = mapped_column(default=0)  # 总练习次数
    correct_count: Mapped[int] = mapped_column(default=0)  # 正确次数
    wrong_count: Mapped[int] = mapped_column(default=0)  # 错误次数
    total_questions: Mapped[int] = mapped_column(default=0)  # 总题目数
    
    # 最近练习情况
    last_practice_time: Mapped[int] = mapped_column(nullable=True)  # 最近练习时间
    last_score: Mapped[float] = mapped_column(default=0.0)  # 最近一次得分
    
    # 掌握状态
    is_mastered: Mapped[int] = mapped_column(default=0)  # 是否已掌握（0-未掌握，1-已掌握）
    mastery_threshold: Mapped[float] = mapped_column(default=0.8)  # 掌握阈值（默认80%）
    
    # 遗忘曲线相关
    next_review_time: Mapped[int] = mapped_column(nullable=True)  # 下次复习时间
    review_count: Mapped[int] = mapped_column(default=0)  # 复习次数
    
    # 知识点掌握情况（JSON格式，用于详细分析）
    knowledge_breakdown: Mapped[str] = mapped_column(Text, default="{}")  # 各知识点掌握情况
    
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)
    
    # 唯一约束
    __table_args__ = (
        UniqueConstraint('student_id', 'unit_id', name='uq_student_unit'),
    )
    
    # 关联关系
    unit: Mapped["Unit"] = relationship(
        "Unit",
        primaryjoin="foreign(StudentUnitMastery.unit_id) == Unit.id",
        lazy="joined"
    )
```


### 3.2 问题模型调整

```python
class Question(BaseModel):
    __tablename__ = "ah_question"
    # ... 现有字段 ...
    
    # 保留 knowledge 字段用于向后兼容，但标记为已弃用
    knowledge: Mapped[str] = mapped_column(
        String(255),
        comment="已弃用，使用QuestionKnowledge关联表",
        nullable=True
    )
    
    # 新增关联关系
    knowledge_points: Mapped[List["QuestionKnowledge"]] = relationship(
        "QuestionKnowledge",
        back_populates="question",
        cascade="all, delete-orphan"
    )
```

### 3.3 知识点模型调整

```python
class Knowledge(BaseModel):
    # ... 现有字段 ...
    
    # 新增关联关系
    questions: Mapped[List["QuestionKnowledge"]] = relationship(
        "QuestionKnowledge",
        back_populates="knowledge",
        cascade="all, delete-orphan"
    )
    
    # 学生掌握度统计（可选，用于快速查询）
    student_masteries: Mapped[List["StudentKnowledgeMastery"]] = relationship(
        "StudentKnowledgeMastery",
        back_populates="knowledge"
    )
```

## 四、核心功能设计

### 4.1 知识点管理服务

#### 4.1.1 知识点CRUD

```python
class KnowledgeService:
    """知识点管理服务"""
    
    @staticmethod
    async def create_knowledge(
        db: AsyncSession,
        textbook_id: int,
        unit_id: int,
        name: str,
        content: str,
        difficulty: Optional[str] = None,
        importance: int = 5,
        order: int = 0
    ) -> int:
        """创建知识点（简化版，两级结构）"""
        # 验证单元是否存在
        unit = await db.get(Unit, unit_id)
        if not unit:
            raise ValueError("单元不存在")
        
        # 创建知识点
        knowledge = Knowledge(
            textbook_id=textbook_id,
            unit_id=unit_id,
            name=name,
            content=content,
            difficulty=difficulty,
            importance=importance,
            order=order
        )
        
        db.add(knowledge)
        await db.commit()
        await db.refresh(knowledge)
        
        return knowledge.id
    
    @staticmethod
    async def get_knowledge_by_unit(
        db: AsyncSession,
        textbook_id: int,
        unit_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """获取知识点列表（按单元分组，两级结构）"""
        query = select(Knowledge).where(
            and_(
                Knowledge.textbook_id == textbook_id,
                Knowledge.status == 1
            )
        )
        if unit_id:
            query = query.where(Knowledge.unit_id == unit_id)
        
        query = query.order_by(Knowledge.unit_id, Knowledge.order)
        
        result = await db.execute(query)
        knowledge_list = result.scalars().all()
        
        # 按单元分组
        knowledge_by_unit = {}
        for k in knowledge_list:
            if k.unit_id not in knowledge_by_unit:
                knowledge_by_unit[k.unit_id] = []
            
            # 获取题目数量（通过缓存）
            question_count = await KnowledgeService.get_question_count(db, k.id)
            
            knowledge_by_unit[k.unit_id].append({
                "id": k.id,
                "name": k.name,
                "content": k.content,
                "difficulty": k.difficulty,
                "importance": k.importance,
                "order": k.order,
                "question_count": question_count
            })
        
        return knowledge_by_unit
    
    @staticmethod
    @cache(ttl=300)  # 缓存5分钟
    async def get_question_count(
        db: AsyncSession,
        knowledge_id: int
    ) -> int:
        """获取知识点关联的题目数量（使用缓存避免实时计算）"""
        result = await db.execute(
            select(func.count(QuestionKnowledge.id)).where(
                QuestionKnowledge.knowledge_id == knowledge_id
            )
        )
        return result.scalar() or 0
```

#### 4.1.2 问题-知识点关联管理

```python
class QuestionKnowledgeService:
    """问题-知识点关联服务"""
    
    @staticmethod
    async def link_question_to_knowledge(
        db: AsyncSession,
        question_id: int,
        knowledge_ids: List[int],
        primary_knowledge_id: Optional[int] = None,
        weights: Optional[Dict[int, float]] = None
    ):
        """关联问题到知识点"""
        # 删除旧关联
        await db.execute(
            delete(QuestionKnowledge).where(
                QuestionKnowledge.question_id == question_id
            )
        )
        
        # 创建新关联
        for kid in knowledge_ids:
            is_primary = 1 if kid == primary_knowledge_id else 0
            weight = weights.get(kid, 1.0) if weights else 1.0
            
            qk = QuestionKnowledge(
                question_id=question_id,
                knowledge_id=kid,
                is_primary=is_primary,
                weight=weight
            )
            db.add(qk)
        
        # ❌ 不再更新Knowledge.question_count（改为缓存计算）
        # 题目数量通过 KnowledgeService.get_question_count() 方法获取
        
        await db.commit()
    
    @staticmethod
    async def get_questions_by_knowledge(
        db: AsyncSession,
        knowledge_id: int,
        difficulty: Optional[str] = None,
        limit: int = 100
    ) -> List[Question]:
        """根据知识点获取题目"""
        query = (
            select(Question)
            .join(QuestionKnowledge, Question.id == QuestionKnowledge.question_id)
            .where(
                and_(
                    QuestionKnowledge.knowledge_id == knowledge_id,
                    Question.status == 1
                )
            )
        )
        
        if difficulty:
            query = query.where(Question.difficulty == difficulty)
        
        query = query.limit(limit)
        
        result = await db.execute(query)
        return list(result.scalars().all())
```

### 4.2 单元掌握度追踪服务（以单元为维度）

```python
class UnitMasteryService:
    """单元掌握度追踪服务（以单元为维度）"""
    
    @staticmethod
    async def update_mastery(
        db: AsyncSession,
        student_id: str,
        unit_id: int,
        score: float,
        total_questions: int,
        correct_count: int,
        knowledge_breakdown: Optional[Dict[str, Any]] = None
    ):
        """更新单元掌握度"""
        # 获取或创建掌握度记录
        mastery = await db.scalar(
            select(StudentUnitMastery).where(
                and_(
                    StudentUnitMastery.student_id == student_id,
                    StudentUnitMastery.unit_id == unit_id
                )
            )
        )
        
        if not mastery:
            # 获取单元信息
            unit = await db.get(Unit, unit_id)
            if not unit:
                return
            
            mastery = StudentUnitMastery(
                student_id=student_id,
                unit_id=unit_id,
                textbook_id=unit.textbook_id
            )
            db.add(mastery)
        
        # 更新统计信息
        mastery.total_practiced += 1
        mastery.total_questions += total_questions
        mastery.correct_count += correct_count
        mastery.wrong_count += (total_questions - correct_count)
        
        mastery.last_practice_time = now()
        mastery.last_score = score
        
        # ✅ 改进：统一使用指数移动平均(EMA)，避免跳变
        current_accuracy = correct_count / total_questions if total_questions > 0 else 0
        
        # 根据练习次数动态调整学习率
        # 前期学习快(大学习率), 后期稳定(小学习率)
        if mastery.total_practiced <= 5:
            alpha = 0.5  # 前5次快速学习
        elif mastery.total_practiced <= 20:
            alpha = 0.3  # 6-20次适度学习
        else:
            alpha = 0.2  # 20次后稳定
        
        # EMA公式: new = old * (1-alpha) + current * alpha
        mastery.mastery_level = (
            mastery.mastery_level * (1 - alpha) +
            current_accuracy * alpha
        )
        
        # ✅ 改进：考虑时间衰减(遗忘曲线)
        if mastery.last_practice_time and mastery.last_practice_time > 0:
            days_since_last = (now() - mastery.last_practice_time) / 86400
            if days_since_last > 7:
                # 超过7天未练习，掌握度衰减
                decay_factor = 0.95 ** (days_since_last / 7)
                mastery.mastery_level *= decay_factor
        
        mastery.mastery_score = mastery.mastery_level * 100
        
        # 判断是否掌握
        mastery.is_mastered = 1 if mastery.mastery_level >= mastery.mastery_threshold else 0
        
        # 更新知识点分解情况
        if knowledge_breakdown:
            existing_breakdown = json.loads(mastery.knowledge_breakdown) if mastery.knowledge_breakdown else {}
            for k, v in knowledge_breakdown.items():
                if k not in existing_breakdown:
                    existing_breakdown[k] = {"total": 0, "correct": 0}
                existing_breakdown[k]["total"] += v.get("total", 0)
                existing_breakdown[k]["correct"] += v.get("correct", 0)
            mastery.knowledge_breakdown = json.dumps(existing_breakdown)
        
        # 更新复习时间（基于遗忘曲线）
        if mastery.is_mastered:
            days = [1, 3, 7, 14, 30, 60]  # 复习间隔（天）
            review_index = min(mastery.review_count, len(days) - 1)
            mastery.next_review_time = now() + days[review_index] * 86400
            mastery.review_count += 1
        else:
            mastery.next_review_time = now() + 86400  # 1天后
        
        await db.commit()
    
    @staticmethod
    async def get_student_unit_mastery_map(
        db: AsyncSession,
        student_id: str,
        textbook_id: int
    ) -> Dict[int, Dict[str, Any]]:
        """获取学生的单元掌握度映射"""
        result = await db.execute(
            select(StudentUnitMastery).where(
                and_(
                    StudentUnitMastery.student_id == student_id,
                    StudentUnitMastery.textbook_id == textbook_id
                )
            )
        )
        
        masteries = result.scalars().all()
        return {
            m.unit_id: {
                "mastery_level": m.mastery_level,
                "mastery_score": m.mastery_score,
                "is_mastered": m.is_mastered,
                "total_practiced": m.total_practiced,
                "correct_count": m.correct_count,
                "wrong_count": m.wrong_count,
                "total_questions": m.total_questions,
                "next_review_time": m.next_review_time,
                "knowledge_breakdown": json.loads(m.knowledge_breakdown) if m.knowledge_breakdown else {}
            }
            for m in masteries
        }
    
    @staticmethod
    async def get_weak_units(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        threshold: float = 0.6,
        limit: int = 10
    ) -> List[int]:
        """获取薄弱单元"""
        result = await db.execute(
            select(StudentUnitMastery.unit_id)
            .where(
                and_(
                    StudentUnitMastery.student_id == student_id,
                    StudentUnitMastery.textbook_id == textbook_id,
                    StudentUnitMastery.mastery_level < threshold,
                    StudentUnitMastery.total_practiced > 0
                )
            )
            .order_by(StudentUnitMastery.mastery_level.asc())
            .limit(limit)
        )
        
        return [row[0] for row in result.all()]
```

### 4.3 RAG问题库服务（Chroma向量数据库）

```python
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import json
import numpy as np
from loguru import logger

class RAGQuestionService:
    """RAG问题库服务（基于Chroma向量数据库）"""
    
    def __init__(self, collection_name: str = "questions", persist_directory: str = "./chroma_db"):
        """
        初始化Chroma客户端
        
        Args:
            collection_name: Chroma集合名称
            persist_directory: 持久化存储目录
        """
        # 初始化Chroma客户端（持久化模式）
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # 获取或创建集合
        try:
            self.collection = self.client.get_collection(name=collection_name)
            logger.info(f"已加载Chroma集合: {collection_name}")
        except Exception:
            # 集合不存在，创建新集合
            self.collection = self.client.create_collection(
                name=collection_name,
                metadata={"description": "问题库向量集合"}
            )
            logger.info(f"已创建Chroma集合: {collection_name}")
        
        # 初始化嵌入模型（可以使用OpenAI、本地模型等）
        from langchain_openai import OpenAIEmbeddings
        from common.settings import envs
        
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=envs.AI_PLATFORM_KEY,
            openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
            model="text-embedding-3-small"  # 或使用其他嵌入模型
        )
    
    async def index_question(
        self,
        db: AsyncSession,
        question_id: int
    ):
        """将题目索引到Chroma向量数据库"""
        # 获取题目信息
        question = await db.get(Question, question_id)
        if not question:
            raise ValueError("题目不存在")
        
        # 构建题目的语义化内容
        semantic_content = self._build_semantic_content(question)
        
        # 生成检索关键词
        search_keywords = self._extract_keywords(question)
        
        # 生成向量嵌入
        embedding = await self._generate_embedding(semantic_content)
        
        # 获取知识点关联
        knowledge_result = await db.execute(
            select(QuestionKnowledge.knowledge_id).where(
                QuestionKnowledge.question_id == question_id
            )
        )
        knowledge_ids = [row[0] for row in knowledge_result.all()]
        
        # 构建Chroma元数据
        metadata = {
            "question_id": str(question_id),
            "unit_id": str(question.unit_id) if question.unit_id else "",
            "difficulty": question.difficulty or "",
            "question_type": question.type or "",
            "knowledge_ids": json.dumps(knowledge_ids) if knowledge_ids else "",
            "search_keywords": search_keywords,
        }
        
        # 检查是否已存在索引
        rag_index = await db.scalar(
            select(QuestionRAGIndex).where(
                QuestionRAGIndex.question_id == question_id
            )
        )
        
        chroma_id = f"question_{question_id}"
        
        if not rag_index:
            rag_index = QuestionRAGIndex(
                question_id=question_id,
                chroma_id=chroma_id,
                unit_id=question.unit_id,
                difficulty=question.difficulty,
                question_type=question.type,
                search_keywords=search_keywords,
                semantic_content=semantic_content,
                embedding_vector=json.dumps(embedding.tolist()) if isinstance(embedding, np.ndarray) else json.dumps(embedding),
                knowledge_ids=json.dumps(knowledge_ids) if knowledge_ids else None
            )
            db.add(rag_index)
        else:
            rag_index.semantic_content = semantic_content
            rag_index.search_keywords = search_keywords
            rag_index.embedding_vector = json.dumps(embedding.tolist()) if isinstance(embedding, np.ndarray) else json.dumps(embedding)
            rag_index.chroma_id = chroma_id
            rag_index.update_time = now()
        
        await db.commit()
        
        # 添加到Chroma集合（使用同步方法，因为Chroma客户端是同步的）
        try:
            # 检查是否已存在
            existing = self.collection.get(ids=[chroma_id])
            if existing['ids']:
                # 更新现有文档
                self.collection.update(
                    ids=[chroma_id],
                    embeddings=[embedding.tolist() if isinstance(embedding, np.ndarray) else embedding],
                    documents=[semantic_content],
                    metadatas=[metadata]
                )
                logger.info(f"已更新Chroma文档: {chroma_id}")
            else:
                # 添加新文档
                self.collection.add(
                    ids=[chroma_id],
                    embeddings=[embedding.tolist() if isinstance(embedding, np.ndarray) else embedding],
                    documents=[semantic_content],
                    metadatas=[metadata]
                )
                logger.info(f"已添加Chroma文档: {chroma_id}")
        except Exception as e:
            logger.error(f"Chroma索引失败: {e}")
            raise
    
    async def retrieve_questions(
        self,
        db: AsyncSession,
        query: str,
        unit_ids: Optional[List[int]] = None,
        difficulty: Optional[str] = None,
        question_type: Optional[str] = None,
        limit: int = 10
    ) -> List[int]:
        """使用Chroma向量相似度检索相关题目"""
        # 1. 生成查询向量
        query_embedding = await self._generate_embedding(query)
        
        # 2. 构建过滤条件（Chroma metadata过滤）
        where_clause = {}
        if unit_ids:
            where_clause["unit_id"] = {"$in": [str(uid) for uid in unit_ids]}
        if difficulty:
            where_clause["difficulty"] = difficulty
        if question_type:
            where_clause["question_type"] = question_type
        
        # 3. 使用Chroma进行向量相似度搜索
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding.tolist() if isinstance(query_embedding, np.ndarray) else query_embedding],
                n_results=limit * 2,  # 多取一些，后续可以过滤
                where=where_clause if where_clause else None
            )
            
            # 4. 从结果中提取题目ID
            question_ids = []
            if results['ids'] and len(results['ids']) > 0:
                for chroma_id in results['ids'][0]:
                    # 从chroma_id中提取question_id（格式：question_{id}）
                    if chroma_id.startswith("question_"):
                        qid = int(chroma_id.replace("question_", ""))
                        question_ids.append(qid)
            
            # 5. 更新检索统计
            if question_ids:
                await db.execute(
                    update(QuestionRAGIndex)
                    .where(QuestionRAGIndex.question_id.in_(question_ids))
                    .values(
                        retrieval_count=QuestionRAGIndex.retrieval_count + 1,
                        last_retrieval_time=now()
                    )
                )
                await db.commit()
            
            return question_ids[:limit]
            
        except Exception as e:
            logger.error(f"Chroma检索失败: {e}")
            # 降级到数据库关键词检索
            return await self._fallback_keyword_search(
                db, query, unit_ids, difficulty, question_type, limit
            )
    
    async def _fallback_keyword_search(
        self,
        db: AsyncSession,
        query: str,
        unit_ids: Optional[List[int]] = None,
        difficulty: Optional[str] = None,
        question_type: Optional[str] = None,
        limit: int = 10
    ) -> List[int]:
        """降级方案：使用数据库关键词检索"""
        db_query = select(QuestionRAGIndex.question_id)
        
        # 关键词匹配
        if query:
            keywords = query.split()
            conditions = []
            for keyword in keywords:
                conditions.append(
                    QuestionRAGIndex.search_keywords.contains(keyword)
                )
            if conditions:
                db_query = db_query.where(or_(*conditions))
        
        # 单元过滤
        if unit_ids:
            db_query = db_query.where(QuestionRAGIndex.unit_id.in_(unit_ids))
        
        # 难度过滤
        if difficulty:
            db_query = db_query.where(QuestionRAGIndex.difficulty == difficulty)
        
        # 题目类型过滤
        if question_type:
            db_query = db_query.where(QuestionRAGIndex.question_type == question_type)
        
        db_query = db_query.limit(limit)
        
        result = await db.execute(db_query)
        return [row[0] for row in result.all()]
    
    async def _generate_embedding(self, text: str) -> np.ndarray:
        """生成文本的向量嵌入"""
        # 使用嵌入模型生成向量
        embedding = await self.embeddings.aembed_query(text)
        return np.array(embedding)
    
    def _build_semantic_content(self, question: Question) -> str:
        """构建题目的语义化内容"""
        content_parts = [
            f"题目内容：{question.content}",
        ]
        
        if question.options:
            content_parts.append(f"选项：{question.options}")
        
        if question.knowledge:
            content_parts.append(f"知识点：{question.knowledge}")
        
        if question.difficulty:
            content_parts.append(f"难度：{question.difficulty}")
        
        return "\n".join(content_parts)
    
    def _extract_keywords(self, question: Question) -> str:
        """提取题目的关键词"""
        keywords = []
        
        # 从题目内容中提取关键词（可以使用NLP工具）
        # 这里简化处理，实际可以使用jieba等工具
        if question.knowledge:
            keywords.append(question.knowledge)
        
        if question.type:
            keywords.append(question.type)
        
        if question.difficulty:
            keywords.append(question.difficulty)
        
        return ",".join(keywords)
    
    def delete_question(self, question_id: int):
        """从Chroma中删除题目"""
        chroma_id = f"question_{question_id}"
        try:
            self.collection.delete(ids=[chroma_id])
            logger.info(f"已从Chroma删除文档: {chroma_id}")
        except Exception as e:
            logger.error(f"Chroma删除失败: {e}")
```

### 4.4 基于RAG和单元维度的题目生成服务

```python
class UnitBasedQuestionService:
    """基于单元掌握度的题目生成服务（优化版，无需RAG）"""
    
    @staticmethod
    async def generate_daily_practice_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        count: int = 10
    ) -> List[int]:
        """生成今日练习题目（基于单元掌握度）"""
        # 1. 获取学生单元掌握度
        mastery_map = await UnitMasteryService.get_student_unit_mastery_map(
            db, student_id, textbook_id
        )
        
        # 2. 获取薄弱单元
        weak_unit_ids = await UnitMasteryService.get_weak_units(
            db, student_id, textbook_id, threshold=0.6, limit=5
        )
        
        # 3. 获取需要复习的单元（基于遗忘曲线）
        need_review_units = await db.execute(
            select(StudentUnitMastery.unit_id).where(
                and_(
                    StudentUnitMastery.student_id == student_id,
                    StudentUnitMastery.textbook_id == textbook_id,
                    StudentUnitMastery.next_review_time <= now(),
                    StudentUnitMastery.is_mastered == 1
                )
            )
        )
        review_unit_ids = [row[0] for row in need_review_units.all()]
        
        # 4. 获取新单元（从未练习过的）
        all_units_result = await db.execute(
            select(Unit.id).where(
                and_(
                    Unit.textbook_id == textbook_id,
                    Unit.status == 1
                )
            )
        )
        all_unit_ids = {row[0] for row in all_units_result.all()}
        practiced_unit_ids = set(mastery_map.keys())
        new_unit_ids = list(all_unit_ids - practiced_unit_ids)
        
        # 5. 分配题目数量
        question_ids = []
        
        # 30% 薄弱单元
        weak_count = int(count * 0.3)
        if weak_unit_ids:
            weak_questions = await ImprovedQuestionSelector.select_questions_with_mastery(
                db, student_id, textbook_id, weak_unit_ids[:3], weak_count
            )
            question_ids.extend(weak_questions)
        
        # 20% 需要复习的单元
        review_count = int(count * 0.2)
        if review_unit_ids:
            review_questions = await ImprovedQuestionSelector.select_questions_with_mastery(
                db, student_id, textbook_id, review_unit_ids[:2], review_count
            )
            question_ids.extend(review_questions)
        
        # 30% 巩固练习（已掌握但需要巩固）
        consolidate_unit_ids = [
            uid for uid, mastery in mastery_map.items()
            if mastery["is_mastered"] == 1 and uid not in review_unit_ids
        ]
        consolidate_count = int(count * 0.3)
        if consolidate_unit_ids:
            consolidate_questions = await ImprovedQuestionSelector.select_questions_with_mastery(
                db, student_id, textbook_id, consolidate_unit_ids[:3], consolidate_count
            )
            question_ids.extend(consolidate_questions)
        
        # 20% 新单元
        new_count = count - len(question_ids)
        if new_unit_ids:
            new_questions = await ImprovedQuestionSelector.select_questions_with_mastery(
                db, student_id, textbook_id, new_unit_ids[:2], new_count
            )
            question_ids.extend(new_questions)
        
        # 如果不够，随机补充
        if len(question_ids) < count:
            remaining = count - len(question_ids)
            extra_questions = await ImprovedQuestionSelector._get_random_questions(
                db, textbook_id, remaining, exclude_ids=question_ids
            )
            question_ids.extend(extra_questions)
        
        return question_ids[:count]
    
    @staticmethod
    async def generate_unit_practice_questions(
        db: AsyncSession,
        student_id: str,
        unit_id: int,
        count: int = 15
    ) -> List[int]:
        """生成单元练习题目（基于单元掌握度）"""
        # 获取单元信息
        unit = await db.get(Unit, unit_id)
        if not unit:
            return []
        
        # 使用优化的题目选择服务
        question_ids = await ImprovedQuestionSelector.select_questions_with_mastery(
            db, student_id, unit.textbook_id, [unit_id], count
        )
        
        return question_ids
    
    @staticmethod
    async def generate_assessment_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        unit_ids: Optional[List[int]] = None,
        difficulty_range: Optional[Tuple[str, str]] = None,
        count: int = 20
    ) -> List[int]:
        """生成能力评测题目（基于单元掌握度）"""
        # 如果指定了单元，使用这些单元
        if not unit_ids:
            # 获取教材的所有单元
            units_result = await db.execute(
                select(Unit.id).where(
                    and_(
                        Unit.textbook_id == textbook_id,
                        Unit.status == 1
                    )
                )
            )
            unit_ids = [row[0] for row in units_result.all()]
        
        # 使用优化的题目选择服务
        question_ids = await ImprovedQuestionSelector.select_questions_with_mastery(
            db, student_id, textbook_id, unit_ids, count
        )
        
        return question_ids
    
    @staticmethod
    async def _get_random_questions(
        db: AsyncSession,
        textbook_id: int,
        count: int,
        exclude_ids: List[int]
    ) -> List[int]:
        """获取随机题目"""
        result = await db.execute(
            select(Question.id)
            .where(
                and_(
                    Question.textbook_id == textbook_id,
                    Question.status == 1,
                    Question.id.not_in(exclude_ids) if exclude_ids else True
                )
            )
            .order_by(func.random())
            .limit(count)
        )
        return [row[0] for row in result.all()]
    
    @staticmethod
    async def _get_questions_by_knowledge(
        db: AsyncSession,
        knowledge_ids: List[int],
        exclude_ids: List[int],
        count: int,
        difficulty: Optional[str] = None
    ) -> List[int]:
        """根据知识点获取题目"""
        if not knowledge_ids:
            return []
        
        query = (
            select(Question.id)
            .join(QuestionKnowledge, Question.id == QuestionKnowledge.question_id)
            .where(
                and_(
                    QuestionKnowledge.knowledge_id.in_(knowledge_ids),
                    Question.textbook_id.in_(
                        select(Knowledge.textbook_id).where(
                            Knowledge.id.in_(knowledge_ids)
                        )
                    ),
                    Question.status == 1,
                    Question.id.not_in(exclude_ids) if exclude_ids else True
                )
            )
            .distinct()
        )
        
        if difficulty:
            query = query.where(Question.difficulty == difficulty)
        
        query = query.order_by(func.random()).limit(count)
        
        result = await db.execute(query)
        return [row[0] for row in result.all()]
    
    @staticmethod
    async def generate_unit_practice_questions(
        db: AsyncSession,
        student_id: str,
        unit_id: int,
        count: int = 15
    ) -> List[int]:
        """生成单元练习题目（基于单元知识点）"""
        # 1. 获取单元的所有知识点
        knowledge_result = await db.execute(
            select(Knowledge.id).where(
                and_(
                    Knowledge.unit_id == unit_id,
                    Knowledge.status == 1
                )
            )
        )
        knowledge_ids = [row[0] for row in knowledge_result.all()]
        
        if not knowledge_ids:
            return []
        
        # 2. 获取学生对这些知识点的掌握度
        mastery_map = await KnowledgeMasteryService.get_student_mastery_map(
            db, student_id, None  # 需要根据unit获取textbook_id
        )
        
        # 3. 按掌握度分配题目
        # 薄弱知识点：40%
        # 普通知识点：40%
        # 已掌握知识点：20%（用于巩固）
        
        weak_knowledge_ids = [
            kid for kid in knowledge_ids
            if kid in mastery_map and mastery_map[kid]["mastery_level"] < 0.6
        ]
        normal_knowledge_ids = [
            kid for kid in knowledge_ids
            if kid in mastery_map and 0.6 <= mastery_map[kid]["mastery_level"] < 0.8
        ]
        mastered_knowledge_ids = [
            kid for kid in knowledge_ids
            if kid in mastery_map and mastery_map[kid]["mastery_level"] >= 0.8
        ]
        
        question_ids = []
        
        # 薄弱知识点
        weak_count = int(count * 0.4)
        weak_questions = await KnowledgeBasedQuestionService._get_questions_by_knowledge(
            db, weak_knowledge_ids, exclude_ids=question_ids, count=weak_count
        )
        question_ids.extend(weak_questions)
        
        # 普通知识点
        normal_count = int(count * 0.4)
        normal_questions = await KnowledgeBasedQuestionService._get_questions_by_knowledge(
            db, normal_knowledge_ids, exclude_ids=question_ids, count=normal_count
        )
        question_ids.extend(normal_questions)
        
        # 已掌握知识点
        mastered_count = count - len(question_ids)
        mastered_questions = await KnowledgeBasedQuestionService._get_questions_by_knowledge(
            db, mastered_knowledge_ids, exclude_ids=question_ids, count=mastered_count
        )
        question_ids.extend(mastered_questions)
        
        return question_ids[:count]
    
    @staticmethod
    async def generate_assessment_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        knowledge_ids: Optional[List[int]] = None,
        difficulty_range: Optional[Tuple[str, str]] = None,
        count: int = 20
    ) -> List[int]:
        """生成能力评测题目（基于知识点和能力水平）"""
        # 如果指定了知识点，只从这些知识点出题
        if knowledge_ids:
            target_knowledge_ids = knowledge_ids
        else:
            # 获取教材的所有知识点
            knowledge_result = await db.execute(
                select(Knowledge.id).where(
                    and_(
                        Knowledge.textbook_id == textbook_id,
                        Knowledge.status == 1
                    )
                )
            )
            target_knowledge_ids = [row[0] for row in knowledge_result.all()]
        
        # 根据难度范围筛选
        question_ids = []
        if difficulty_range:
            min_difficulty, max_difficulty = difficulty_range
            difficulty_map = {"简单": 1, "普通": 2, "困难": 3}
            min_level = difficulty_map.get(min_difficulty, 1)
            max_level = difficulty_map.get(max_difficulty, 3)
            
            for level in range(min_level, max_level + 1):
                difficulty = {1: "简单", 2: "普通", 3: "困难"}[level]
                questions = await KnowledgeBasedQuestionService._get_questions_by_knowledge(
                    db, target_knowledge_ids, exclude_ids=question_ids,
                    count=count // (max_level - min_level + 1),
                    difficulty=difficulty
                )
                question_ids.extend(questions)
        else:
            # 随机选择
            questions = await KnowledgeBasedQuestionService._get_questions_by_knowledge(
                db, target_knowledge_ids, exclude_ids=question_ids, count=count
            )
            question_ids.extend(questions)
        
        return question_ids[:count]
    
    @staticmethod
    async def _get_random_questions(
        db: AsyncSession,
        textbook_id: int,
        count: int,
        exclude_ids: List[int]
    ) -> List[int]:
        """获取随机题目"""
        result = await db.execute(
            select(Question.id)
            .where(
                and_(
                    Question.textbook_id == textbook_id,
                    Question.status == 1,
                    Question.id.not_in(exclude_ids) if exclude_ids else True
                )
            )
            .order_by(func.random())
            .limit(count)
        )
        return [row[0] for row in result.all()]
```

## 五、数据库迁移方案

### 5.1 新增表

```sql
-- 问题-知识点关联表
CREATE TABLE `ah_question_knowledge` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `knowledge_id` int NOT NULL,
  `is_primary` int DEFAULT 1 COMMENT '是否主要知识点',
  `weight` float DEFAULT 1.0 COMMENT '权重',
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_question_knowledge` (`question_id`, `knowledge_id`),
  KEY `idx_question_id` (`question_id`),
  KEY `idx_knowledge_id` (`knowledge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 学生单元掌握度表（以单元为维度）
CREATE TABLE `ah_student_unit_mastery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `unit_id` int NOT NULL,
  `textbook_id` int NOT NULL,
  `mastery_level` float DEFAULT 0.0 COMMENT '掌握度（0-1）',
  `mastery_score` float DEFAULT 0.0 COMMENT '掌握分数（0-100）',
  `total_practiced` int DEFAULT 0 COMMENT '总练习次数',
  `correct_count` int DEFAULT 0 COMMENT '正确次数',
  `wrong_count` int DEFAULT 0 COMMENT '错误次数',
  `total_questions` int DEFAULT 0 COMMENT '总题目数',
  `last_practice_time` int DEFAULT NULL COMMENT '最近练习时间',
  `last_score` float DEFAULT 0.0 COMMENT '最近一次得分',
  `is_mastered` int DEFAULT 0 COMMENT '是否已掌握',
  `mastery_threshold` float DEFAULT 0.8 COMMENT '掌握阈值',
  `next_review_time` int DEFAULT NULL COMMENT '下次复习时间',
  `review_count` int DEFAULT 0 COMMENT '复习次数',
  `knowledge_breakdown` text COMMENT '各知识点掌握情况（JSON）',
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_unit` (`student_id`, `unit_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_unit_id` (`unit_id`),
  KEY `idx_textbook_id` (`textbook_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ❌ 已删除：RAG问题库索引表（Chroma向量数据库）
-- 理由：RAG方案过度复杂，使用优化的SQL查询替代
```

### 5.2 修改现有表

```sql
-- 知识点表新增字段（简化版，两级结构）
ALTER TABLE `ah_knowledge`
  ADD COLUMN `order` int DEFAULT 0 COMMENT '同级排序',
  ADD COLUMN `difficulty` varchar(50) DEFAULT NULL COMMENT '知识点难度',
  ADD COLUMN `importance` int DEFAULT 5 COMMENT '重要性（1-10）';
  
-- ❌ 已删除：parent_id, level, prerequisite_ids, question_count
-- 理由：简化为两级结构（单元->知识点），避免过度复杂
-- question_count改为通过缓存计算，避免数据冗余
```

### 5.3 数据迁移脚本

```python
async def migrate_existing_data(db: AsyncSession):
    """迁移现有数据"""
    # 1. 将 Question.knowledge 字符串转换为 QuestionKnowledge 关联
    questions_result = await db.execute(
        select(Question).where(Question.knowledge.isnot(None))
    )
    questions = questions_result.scalars().all()
    
    for question in questions:
        if not question.knowledge:
            continue
        
        # 查找或创建知识点
        knowledge = await db.scalar(
            select(Knowledge).where(
                and_(
                    Knowledge.name == question.knowledge,
                    Knowledge.textbook_id == question.textbook_id
                )
            )
        )
        
        if not knowledge:
            # 创建新知识点
            knowledge = Knowledge(
                textbook_id=question.textbook_id,
                unit_id=question.unit_id,
                name=question.knowledge,
                content=question.knowledge
            )
            db.add(knowledge)
            await db.flush()
        
        # 创建关联
        qk = QuestionKnowledge(
            question_id=question.id,
            knowledge_id=knowledge.id,
            is_primary=1,
            weight=1.0
        )
        db.add(qk)
    
    await db.commit()
    
    # 2. 根据历史学习记录初始化掌握度
    # ... 实现逻辑 ...
```

## 六、集成到现有系统

### 6.1 修改今日练习服务

在 `daily_practice.py` 中，将 `_select_daily_questions` 方法改为使用基于单元掌握度的题目生成：

```python
@staticmethod
async def _select_daily_questions(
    db: AsyncSession, student_id: str, textbook_id: int, count: int
) -> List[int]:
    """智能选择今日练习题目（基于单元掌握度，优化SQL查询）"""
    from common.services.unit_based_question_service import UnitBasedQuestionService
    
    return await UnitBasedQuestionService.generate_daily_practice_questions(
        db, student_id, textbook_id, count
    )
```

### 6.2 修改答题提交逻辑

在提交答案时，更新单元掌握度：

```python
@staticmethod
async def submit_answer(...):
    """提交答案"""
    # ... 现有逻辑 ...
    
    # 更新单元掌握度（在完成练习时统一更新，这里只记录答案）
    # 单元掌握度在 complete_practice 时统一计算和更新
```

### 6.3 修改完成练习逻辑

在完成练习时，更新单元掌握度：

```python
@staticmethod
async def complete_practice(...):
    """完成练习并生成报告"""
    # ... 现有逻辑 ...
    
    # 更新单元掌握度
    from common.services.unit_mastery_service import UnitMasteryService
    
    # 统计知识点掌握情况
    knowledge_breakdown = {}
    for qid in question_ids:
        answer_data = answers.get(str(qid), {})
        if answer_data:
            q_result = await db.execute(select(Question).where(Question.id == qid))
            question = q_result.scalar_one_or_none()
            
            if question and question.knowledge:
                knowledge = question.knowledge
                if knowledge not in knowledge_breakdown:
                    knowledge_breakdown[knowledge] = {"total": 0, "correct": 0}
                knowledge_breakdown[knowledge]["total"] += 1
                if answer_data.get("is_correct"):
                    knowledge_breakdown[knowledge]["correct"] += 1
    
    # 更新单元掌握度（假设所有题目属于同一单元，或按单元分组更新）
    unit_id = question.unit_id  # 从题目中获取单元ID
    await UnitMasteryService.update_mastery(
        db,
        student_id=student_id,
        unit_id=unit_id,
        score=score,
        total_questions=session.total_questions,
        correct_count=correct_count,
        knowledge_breakdown=knowledge_breakdown
    )
    
    # ... 其余逻辑 ...
```

### 6.4 完善教材解析功能（parse_textbook）

更新 `server/admin/services/textbook.py` 中的 `parse_textbook` 函数，使其与优化后的知识库设计一致：

```python
async def parse_textbook(db: AsyncSession, id: int):
    """解析教材（优化版，支持知识点排序和属性）"""
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")
    if not textbook.file:
        raise ValueError("教材文件不存在")
    if not textbook.index_file_id:
        raise ValueError("教材文件还未被解析")

    # 重新解析，需要清理教材相关数据
    await _clean_textbook(db, id)

    # 调用AI解析教材
    data = AliyunApp.invoke(
        query=f"解析教材{textbook.file}",
        app_id="e18385d4dd3e4801938b6f68024466b3",
        file_id=textbook.index_file_id,
    )

    units = data.get("units")
    if not units:
        raise ValueError("教材解析格式错误")

    # 解析单元和知识点
    for unit_index, item in enumerate(units):
        # 创建单元
        unit = Unit(
            textbook_id=id,
            name=item.get("unit_name"),
            content=item.get("unit_content")
        )
        db.add(unit)
        await db.commit()
        await db.refresh(unit)

        # 创建知识点（带排序）
        knowledges = item.get("topics")
        if not knowledges:
            continue

        knowledge_objects = []
        for knowledge_index, topic in enumerate(knowledges):
            # ✅ 优化：设置知识点排序（order）
            knowledge = Knowledge(
                unit_id=unit.id,
                textbook_id=id,
                name=topic.get("topic_name"),
                content=topic.get("topic_content"),
                order=knowledge_index,  # 按解析顺序设置排序
                # difficulty 和 importance 可以后续手动设置或通过AI分析
                difficulty=None,
                importance=5  # 默认重要性
            )
            knowledge_objects.append(knowledge)
        
        db.add_all(knowledge_objects)
        await db.commit()

    textbook.is_parsed = 1
    await db.commit()
    return units


async def _clean_textbook(db: AsyncSession, id: int):
    """清理教材相关数据（优化版，包含QuestionKnowledge关联）"""
    from common.database import QuestionKnowledge
    
    # 1. 删除问题-知识点关联
    stmt = delete(QuestionKnowledge).where(
        QuestionKnowledge.knowledge_id.in_(
            select(Knowledge.id).where(Knowledge.textbook_id == id)
        )
    )
    await db.execute(stmt)
    
    # 2. 删除知识点
    stmt = delete(Knowledge).where(Knowledge.textbook_id == id)
    await db.execute(stmt)
    
    # 3. 删除单元
    stmt = delete(Unit).where(Unit.textbook_id == id)
    await db.execute(stmt)
    
    # 4. 更新所有问题关联（清理旧的字符串字段）
    stmt = (
        update(Question)
        .where(Question.textbook_id == id)
        .values({"unit_id": None, "knowledge": None})
    )
    await db.execute(stmt)
    
    await db.commit()
```

**可选增强功能**：

1. **AI分析知识点属性**（可选）：
```python
# 在解析时，可以通过AI分析知识点的难度和重要性
for topic in knowledges:
    # 调用AI分析知识点属性
    analysis = AliyunApp.invoke(
        query=f"分析知识点难度和重要性：{topic.get('topic_name')}",
        app_id="your_analysis_app_id",
        file_id=textbook.index_file_id,
    )
    
    knowledge = Knowledge(
        unit_id=unit.id,
        textbook_id=id,
        name=topic.get("topic_name"),
        content=topic.get("topic_content"),
        order=knowledge_index,
        difficulty=analysis.get("difficulty"),  # AI分析结果
        importance=analysis.get("importance", 5)  # AI分析结果
    )
```

2. **自动关联题目到知识点**（可选）：
```python
# 解析完成后，尝试自动关联已有题目到知识点
async def auto_link_questions_to_knowledge(db: AsyncSession, textbook_id: int):
    """自动关联题目到知识点（基于题目内容匹配）"""
    from common.services.question_knowledge_service import QuestionKnowledgeService
    
    # 获取教材的所有知识点
    knowledges = await db.execute(
        select(Knowledge).where(
            and_(Knowledge.textbook_id == textbook_id, Knowledge.status == 1)
        )
    )
    knowledge_list = knowledges.scalars().all()
    
    # 获取教材的所有题目
    questions = await db.execute(
        select(Question).where(
            and_(Question.textbook_id == textbook_id, Question.status == 1)
        )
    )
    question_list = questions.scalars().all()
    
    # 简单的关键词匹配（可以优化为更智能的匹配算法）
    for question in question_list:
        matched_knowledge_ids = []
        for knowledge in knowledge_list:
            # 如果题目内容或知识点字段包含知识点名称
            if (knowledge.name in question.content or 
                (question.knowledge and knowledge.name in question.knowledge)):
                matched_knowledge_ids.append(knowledge.id)
        
        if matched_knowledge_ids:
            await QuestionKnowledgeService.link_question_to_knowledge(
                db, question.id, matched_knowledge_ids,
                primary_knowledge_id=matched_knowledge_ids[0] if matched_knowledge_ids else None
            )
```

### 6.5 题目创建/更新时关联知识点

在题目创建或更新时，自动关联知识点：

```python
async def create_question(...):
    """创建题目"""
    # ... 创建题目逻辑 ...
    
    # 关联知识点（如果提供了知识点ID）
    if knowledge_ids:
        from common.services.question_knowledge_service import QuestionKnowledgeService
        await QuestionKnowledgeService.link_question_to_knowledge(
            db, question.id, knowledge_ids
        )
    
    # ... 其余逻辑 ...

async def update_question(...):
    """更新题目"""
    # ... 更新题目逻辑 ...
    
    # 更新知识点关联（如果提供了知识点ID）
    if knowledge_ids:
        from common.services.question_knowledge_service import QuestionKnowledgeService
        await QuestionKnowledgeService.link_question_to_knowledge(
            db, question.id, knowledge_ids
        )
    
    # ... 其余逻辑 ...
```

### 6.6 修改单元练习服务

在 `unit_practice.py` 中，使用基于单元掌握度的题目生成：

```python
async def _select_unit_questions(
    db: AsyncSession, student_id: str, unit_id: int, count: int
) -> List[int]:
    """选择单元练习题目（基于单元掌握度）"""
    from common.services.unit_based_question_service import UnitBasedQuestionService
    
    return await UnitBasedQuestionService.generate_unit_practice_questions(
        db, student_id, unit_id, count
    )
```

### 6.7 修改能力评测服务

在 `assessment.py` 中，使用基于单元掌握度的题目生成：

```python
async def _select_assessment_questions(
    db: AsyncSession,
    student_id: str,
    textbook_id: int,
    unit_ids: Optional[List[int]] = None,
    difficulty_range: Optional[Tuple[str, str]] = None,
    count: int = 20
) -> List[int]:
    """选择能力评测题目（基于单元掌握度）"""
    from common.services.unit_based_question_service import UnitBasedQuestionService
    
    return await UnitBasedQuestionService.generate_assessment_questions(
        db, student_id, textbook_id, unit_ids, difficulty_range, count
    )
```

## 七、API接口设计

### 7.1 教材解析API（与知识库集成）

```python
# 上传教材文件
POST /api/admin/textbook/{id}/upload
# 上传PDF/Word等教材文件

# 解析教材（自动创建单元和知识点）
POST /api/admin/textbook/{id}/parse
# 返回解析结果，包含units和topics

# 获取教材的知识点列表（按单元分组）
GET /api/admin/textbook/{id}/knowledges
# 返回格式：{unit_id: [knowledge1, knowledge2, ...]}

# 获取教材的单元列表
GET /api/admin/textbook/{id}/units
# 返回单元列表
```

### 7.2 知识点管理API

```python
# 获取知识点列表（按单元分组，两级结构）
GET /api/admin/knowledge/list?textbook_id=1&unit_id=2

# 创建知识点（手动创建，补充解析遗漏的知识点）
POST /api/admin/knowledge
{
    "textbook_id": 1,
    "unit_id": 2,
    "name": "知识点名称",
    "content": "知识点内容",
    "difficulty": "普通",
    "importance": 5,
    "order": 0
}

# 更新知识点（修改难度、重要性等）
PUT /api/admin/knowledge/{id}
{
    "name": "知识点名称",
    "content": "知识点内容",
    "difficulty": "困难",
    "importance": 8,
    "order": 1
}

# 关联问题到知识点
POST /api/admin/question/{question_id}/knowledge
{
    "knowledge_ids": [1, 2, 3],
    "primary_knowledge_id": 1,
    "weights": {1: 1.0, 2: 0.5, 3: 0.3}
}

# 自动关联题目到知识点（基于内容匹配）
POST /api/admin/textbook/{id}/auto-link-questions
# 尝试自动关联教材的所有题目到知识点
```

### 7.3 单元掌握度查询API

```python
# 获取学生单元掌握度
GET /api/student/unit/mastery?textbook_id=1
# 返回：{unit_id: {mastery_level, mastery_score, is_mastered, ...}}

# 获取薄弱单元
GET /api/student/unit/weak?textbook_id=1&threshold=0.6
# 返回：薄弱单元ID列表

# 获取单元掌握度详情
GET /api/student/unit/{unit_id}/mastery
# 返回：单元掌握度详细信息，包括知识点分解情况
```

## 八、实施步骤（优化版）

### 阶段一：核心功能（2周）

✅ 优先级最高：
1. 创建 `ah_question_knowledge` 表（多对多关联）
2. 创建 `ah_student_unit_mastery` 表（单元掌握度）
3. 实现改进的掌握度计算算法（EMA + 时间衰减）
4. 扩展 `ah_knowledge` 表（添加 difficulty, importance, order）

### 阶段二：题目选择优化（1周）

5. 实现基于单元掌握度的智能题目选择（优化SQL查询版本）
6. 集成到今日练习、单元练习
7. 测试和验证推荐效果

### 阶段三：管理界面（1周）

8. 知识点管理界面（CRUD）
9. 问题-知识点关联界面
10. 单元掌握度查询API

### 阶段四：监控和优化（持续）

11. 监控推荐效果指标
12. 收集用户反馈
13. 根据数据调整算法参数

❌ 暂不实施：

- RAG/Chroma向量数据库（除非有明确的高级需求）
- 知识点多层级结构（保持两级：单元->知识点）
- QuestionRAGIndex表

## 十、优势总结（优化版）

1. **单元维度追踪**：以单元为维度追踪学习情况，更符合教学实际
2. **优化的SQL查询**：使用高效的数据库查询替代向量检索，降低系统复杂度
3. **改进的掌握度算法**：使用EMA+时间衰减，更准确地反映学习状态
4. **简化设计**：两级知识点结构，避免过度复杂
5. **精准题目推荐**：基于单元掌握度和难度动态调整，实现个性化推荐
6. **遗忘曲线复习**：支持基于遗忘曲线的智能复习提醒
7. **灵活扩展**：支持多知识点关联，适应复杂题目场景
8. **数据驱动**：为学习分析和报告提供数据基础
9. **维护成本低**：无需向量数据库，减少系统依赖和故障点
10. **性价比高**：保留核心价值，去除不必要的复杂度

