知识库设计方案分析报告

  一、设计合理性评估

  基于对当前代码和设计文档的分析,该设计方案整体合理,但存在一些需要优化的地方。

  ---
  二、设计合理的方面

  ✅ 1. 单元维度追踪策略

  合理性: 非常合理,比知识点维度更符合教学实际

  理由:
  - 当前系统的 Question.knowledge 是字符串,粒度不统一
  - 单元是教材的标准划分,符合教学习惯
  - 便于与现有的 Unit 表无缝集成
  - 减少数据模型复杂度

  优势:
  - 减少掌握度记录数(单元数 << 知识点数)
  - 更易于向学生展示学习进度
  - 符合"单元练习"的业务场景

  ✅ 2. 问题-知识点多对多关联

  合理性: 必要且合理

  理由:
  - 现实中一道题确实可能涉及多个知识点
  - 支持权重(weight)可以区分主次知识点
  - 支持标记主要知识点(is_primary)

  改进建议: 保留当前的 Question.knowledge 字段作为兼容,✅已在设计中体现

  ✅ 3. 知识点层级结构

  合理性: 合理,但需谨慎实施

  理由:
  - 支持知识点的树形组织
  - 便于管理和展示
  - 支持前置知识点(prerequisite_ids)

  潜在问题: 见下文"需要优化的地方"

  ✅ 4. 遗忘曲线复习机制

  合理性: 非常合理

  当前系统: 已有 next_review_time 字段但未充分利用
  # StudentWrongQuestion 表已有但未使用
  next_review_time: Mapped[int] = mapped_column(nullable=True)

  设计改进: 在 StudentUnitMastery 中实现完整的遗忘曲线算法
  days = [1, 3, 7, 14, 30, 60]  # 间隔递增

  ---
  三、需要优化的地方

  ⚠️ 1. RAG/Chroma 方案过度设计

  问题分析:

  当前题目选择已经有成熟的策略:
  # 今日练习: 30%错题 + 40%巩固 + 20%挑战 + 10%新题
  # 单元练习: 30%简单 + 40%普通 + 20%困难 + 10%补充
  # 能力评测: IRT自适应算法

  引入RAG的问题:

  1. 复杂度激增
    - 需要维护Chroma向量数据库
    - 需要嵌入模型API调用(成本)
    - 需要处理向量索引同步
    - 增加系统依赖和故障点
  2. 收益不明显
    - 题目已经通过 unit_id、difficulty、knowledge 精确过滤
    - 当前SQL查询已足够高效
    - 向量检索的"语义相似"在题目场景下意义有限
    - 题目不是长文本,向量化收益小
  3. 题目特性不适合RAG
  # 题目检索的核心条件是结构化的:
  - unit_id: 精确匹配
  - difficulty: 枚举值(简单/普通/困难)
  - knowledge: 分类标签
  - type: 题型(选择/填空等)

  # RAG适合的场景:
  - 长文本语义检索
  - 模糊匹配
  - 相关性排序
  4. 维护成本高
    - 题目创建/更新时需要实时索引到Chroma
    - 向量嵌入生成需要时间和API成本
    - Chroma数据库需要备份和维护

  优化建议: 见下文"优化方案"

  ⚠️ 2. 知识点层级结构的复杂性

  问题:
  # 设计中的字段
  parent_id: 父知识点ID
  level: 层级(1-一级, 2-二级, 3-三级)
  prerequisite_ids: 前置知识点ID列表(JSON)

  潜在风险:
  - 教材知识点本身已经有层级(单元 -> 知识点)
  - 再添加知识点内部层级会导致三层嵌套
  - 前置知识点关系维护困难
  - 管理界面复杂度大幅增加

  实际需求分析:
  - 当前系统的 Knowledge 已经有 unit_id,自然形成两级结构
  - 大部分教学场景下,单元内的知识点是平级的
  - 极少需要知识点间的依赖关系

  优化建议: 简化为两级结构(单元 -> 知识点),必要时才扩展

  ⚠️ 3. 掌握度计算算法可优化

  当前设计:
  if mastery.total_practiced <= 10:
      mastery.mastery_level = correct_count / total_questions
  else:
      # 指数移动平均
      recent_weight = 0.3
      mastery.mastery_level = (
          mastery.mastery_level * (1 - recent_weight) +
          current_level * recent_weight
      )

  问题:
  - 前10次练习的历史数据权重相同(简单平均)
  - 第11次突然切换到指数移动平均,跳变明显
  - 没有考虑时间衰减(遗忘)

  优化建议: 见下文"优化方案"

  ⚠️ 4. 数据冗余和同步问题

  设计中的冗余:
  # Question表
  knowledge: Mapped[str]  # 兼容字段

  # QuestionKnowledge表
  knowledge_id: Mapped[int]  # 关联表

  # Knowledge表
  question_count: Mapped[int]  # 冗余统计

  # QuestionRAGIndex表
  knowledge_ids: Mapped[str]  # JSON格式,再次冗余

  问题:
  - 多处存储知识点信息,容易不一致
  - Knowledge.question_count 需要实时更新
  - QuestionRAGIndex.knowledge_ids 需要与 QuestionKnowledge 同步

  优化建议: 减少冗余,使用数据库视图或缓存

  ---
  四、优化方案

  📋 方案A: 简化版(推荐)

  核心思想: 保留设计的核心价值,去除过度复杂的部分

  1. 不引入RAG/Chroma,优化现有SQL查询

  替代方案:
  class ImprovedQuestionSelector:
      """优化的题目选择服务(无需RAG)"""

      @staticmethod
      async def select_questions_with_mastery(
          db: AsyncSession,
          student_id: str,
          unit_ids: List[int],
          count: int,
          strategy: str = "adaptive"
      ) -> List[int]:
          """基于单元掌握度的智能题目选择"""

          # 1. 获取单元掌握度
          mastery_map = await UnitMasteryService.get_student_unit_mastery_map(
              db, student_id, textbook_id
          )

          # 2. 根据掌握度分配难度
          question_pool = []
          for unit_id in unit_ids:
              mastery_level = mastery_map.get(unit_id, {}).get("mastery_level", 0)

              # 动态难度调整
              if mastery_level < 0.6:
                  # 薄弱单元: 60%简单 + 30%普通 + 10%困难
                  difficulties = [
                      ("简单", int(count * 0.6)),
                      ("普通", int(count * 0.3)),
                      ("困难", int(count * 0.1))
                  ]
              elif mastery_level < 0.8:
                  # 一般掌握: 30%简单 + 50%普通 + 20%困难
                  difficulties = [
                      ("简单", int(count * 0.3)),
                      ("普通", int(count * 0.5)),
                      ("困难", int(count * 0.2))
                  ]
              else:
                  # 已掌握: 20%简单 + 40%普通 + 40%困难
                  difficulties = [
                      ("简单", int(count * 0.2)),
                      ("普通", int(count * 0.4)),
                      ("困难", int(count * 0.4))
                  ]

              # 3. 优先选择错题
              wrong_questions = await self._get_unit_wrong_questions(
                  db, student_id, unit_id, limit=int(count * 0.3)
              )
              question_pool.extend(wrong_questions)

              # 4. 按难度分配
              for difficulty, num in difficulties:
                  if len(question_pool) >= count:
                      break
                  questions = await self._get_questions_by_difficulty(
                      db, unit_id, difficulty, num, exclude=question_pool
                  )
                  question_pool.extend(questions)

          return question_pool[:count]

      @staticmethod
      async def _get_questions_by_difficulty(
          db: AsyncSession,
          unit_id: int,
          difficulty: str,
          limit: int,
          exclude: List[int] = []
      ) -> List[int]:
          """高效的SQL查询(无需向量检索)"""
          query = (
              select(Question.id)
              .where(
                  and_(
                      Question.unit_id == unit_id,
                      Question.difficulty == difficulty,
                      Question.status == 1,
                      Question.id.not_in(exclude) if exclude else True
                  )
              )
              .order_by(func.random())
              .limit(limit)
          )
          result = await db.execute(query)
          return [row[0] for row in result.all()]

  优势:
  - 保留基于掌握度的智能推荐
  - 无需向量数据库,降低复杂度
  - 充分利用数据库索引,查询高效
  - 维护成本低

  2. 简化知识点结构

  优化后的模型:
  class Knowledge(BaseModel):
      """知识点模型(简化版)"""
      __tablename__ = "ah_knowledge"

      id: Mapped[int] = mapped_column(primary_key=True)
      textbook_id: Mapped[int] = mapped_column(nullable=False, index=True)
      unit_id: Mapped[int] = mapped_column(nullable=False, index=True)

      # 基本信息
      name: Mapped[str] = mapped_column(String(255), nullable=False)
      content: Mapped[str] = mapped_column(Text, nullable=False)

      # 简化的属性(可选)
      difficulty: Mapped[str] = mapped_column(String(50), nullable=True)
      importance: Mapped[int] = mapped_column(default=5)  # 1-10
      order: Mapped[int] = mapped_column(default=0)  # 排序

      # ❌ 删除: parent_id, level, prerequisite_ids
      # 理由: 单元已经提供层级,避免过度复杂

      status: Mapped[int] = mapped_column(default=1)
      create_time: Mapped[int] = mapped_column(default=now)
      update_time: Mapped[int] = mapped_column(default=now)

  保留的关联表:
  class QuestionKnowledge(BaseModel):
      """问题-知识点关联(多对多)"""
      __tablename__ = "ah_question_knowledge"

      id: Mapped[int] = mapped_column(primary_key=True)
      question_id: Mapped[int] = mapped_column(nullable=False, index=True)
      knowledge_id: Mapped[int] = mapped_column(nullable=False, index=True)

      is_primary: Mapped[int] = mapped_column(default=1)
      weight: Mapped[float] = mapped_column(default=1.0)

      create_time: Mapped[int] = mapped_column(default=now)

      __table_args__ = (
          UniqueConstraint('question_id', 'knowledge_id'),
      )

  3. 改进掌握度计算算法

  class ImprovedUnitMasteryService:
      """改进的单元掌握度服务"""

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
          """改进的掌握度计算"""
          mastery = await db.scalar(
              select(StudentUnitMastery).where(
                  and_(
                      StudentUnitMastery.student_id == student_id,
                      StudentUnitMastery.unit_id == unit_id
                  )
              )
          )

          if not mastery:
              unit = await db.get(Unit, unit_id)
              mastery = StudentUnitMastery(
                  student_id=student_id,
                  unit_id=unit_id,
                  textbook_id=unit.textbook_id
              )
              db.add(mastery)

          # 更新统计
          mastery.total_practiced += 1
          mastery.total_questions += total_questions
          mastery.correct_count += correct_count
          mastery.wrong_count += (total_questions - correct_count)
          mastery.last_practice_time = now()
          mastery.last_score = score

          # ✅ 改进: 统一使用指数移动平均(EMA)
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

          # ✅ 改进: 考虑时间衰减(遗忘曲线)
          if mastery.last_practice_time:
              days_since_last = (now() - mastery.last_practice_time) / 86400
              if days_since_last > 7:
                  # 超过7天未练习,掌握度衰减
                  decay_factor = 0.95 ** (days_since_last / 7)
                  mastery.mastery_level *= decay_factor

          mastery.mastery_score = mastery.mastery_level * 100
          mastery.is_mastered = 1 if mastery.mastery_level >= 0.8 else 0

          # 更新复习时间
          if mastery.is_mastered:
              days = [1, 3, 7, 14, 30, 60]
              review_index = min(mastery.review_count, len(days) - 1)
              mastery.next_review_time = now() + days[review_index] * 86400
              mastery.review_count += 1
          else:
              mastery.next_review_time = now() + 86400

          # 更新知识点分解
          if knowledge_breakdown:
              existing = json.loads(mastery.knowledge_breakdown or "{}")
              for k, v in knowledge_breakdown.items():
                  if k not in existing:
                      existing[k] = {"total": 0, "correct": 0}
                  existing[k]["total"] += v.get("total", 0)
                  existing[k]["correct"] += v.get("correct", 0)
              mastery.knowledge_breakdown = json.dumps(existing)

          await db.commit()

  改进点:
  - ✅ 统一使用EMA,避免跳变
  - ✅ 动态学习率,前期快速学习,后期稳定
  - ✅ 引入时间衰减,模拟遗忘曲线
  - ✅ 保持遗忘曲线复习机制

  4. 减少数据冗余

  策略:
  # 1. Question.knowledge 保留作为兼容字段,但标记为 deprecated
  class Question(BaseModel):
      knowledge: Mapped[str] = mapped_column(
          String(255),
          nullable=True,
          comment="已弃用,使用QuestionKnowledge关联表"
      )

  # 2. Knowledge.question_count 改为计算属性或缓存
  class KnowledgeService:
      @staticmethod
      @cache(ttl=300)  # 缓存5分钟
      async def get_question_count(db: AsyncSession, knowledge_id: int) -> int:
          """通过缓存避免实时计算"""
          result = await db.execute(
              select(func.count(QuestionKnowledge.id)).where(
                  QuestionKnowledge.knowledge_id == knowledge_id
              )
          )
          return result.scalar() or 0

  # 3. ❌ 不创建 QuestionRAGIndex 表
  #    直接使用 QuestionKnowledge 关联查询

  ---
  📋 方案B: 渐进式引入RAG(仅适用于特定场景)

  如果确实需要RAG,建议仅在以下场景使用:

  场景1: AI生成题目推荐理由

  # 用RAG检索相似题目,生成推荐语
  similar_questions = await rag_service.find_similar_questions(
      question_content="当前题目内容",
      limit=5
  )

  # 生成推荐语: "这道题与你之前做过的XX题相似,都涉及XX知识点"
  recommendation = await llm.generate_recommendation(similar_questions)

  场景2: 题目去重和相似度检测

  # 管理员上传新题时,检测是否与现有题目重复
  is_duplicate = await rag_service.check_duplicate(
      new_question_content,
      threshold=0.95
  )

  场景3: 学生提问匹配相关题目

  # 学生问"怎么解决XX类问题",匹配相关题目
  related_questions = await rag_service.match_questions_by_description(
      student_question="如何计算圆的面积",
      limit=10
  )

  实现建议:
  - 使用异步任务索引,不阻塞主流程
  - 提供降级方案(Chroma不可用时用SQL)
  - 监控API成本和调用频率

  ---
  五、实施建议

  阶段1: 核心功能(2周)

  ✅ 优先级最高:
  1. 创建 ah_question_knowledge 表(多对多关联)
  2. 创建 ah_student_unit_mastery 表(单元掌握度)
  3. 实现改进的掌握度计算算法(EMA + 时间衰减)
  4. 扩展 ah_knowledge 表(添加 difficulty, importance, order)

  阶段2: 题目选择优化(1周)

  5. 实现基于单元掌握度的智能题目选择(无RAG版本)
  6. 集成到今日练习、单元练习
  7. 测试和验证推荐效果

  阶段3: 管理界面(1周)

  8. 知识点管理界面(CRUD)
  9. 问题-知识点关联界面
  10. 单元掌握度查询API

  阶段4: 监控和优化(持续)

  11. 监控推荐效果指标
  12. 收集用户反馈
  13. 根据数据调整算法参数

  ❌ 暂不实施:

  - RAG/Chroma向量数据库(除非有明确的高级需求)
  - 知识点多层级结构(保持两级: 单元->知识点)
  - QuestionRAGIndex表

  ---
  六、总结

  合理的设计:

  ✅ 单元维度掌握度追踪✅ 问题-知识点多对多关联✅ 遗忘曲线复习机制✅ 知识点基础属性(difficulty, importance)

  需要优化:

  ⚠️ RAG/Chroma过度复杂 → 用优化的SQL查询替代⚠️ 知识点多层级 → 简化为两级结构⚠️ 掌握度算法 → 改用EMA+时间衰减⚠️ 数据冗余 →
  减少冗余字段,使用缓存

  核心价值:

  保留设计的核心价值(单元掌握度追踪、多对多关联、遗忘曲线),去除不必要的复杂度(RAG/Chroma、多层级),实现性价比最高的升级方案。