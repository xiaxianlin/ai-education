import pytest
import pytest_asyncio
from sqlalchemy import select
from student.services import practice as practice_service
from shared.core.database import Student, Textbook, Unit, Question, PracticeSession, PracticeAnswer, PracticeReport
from shared.utils.time import now

@pytest_asyncio.fixture
async def seeded_data(db_session):
    """预置练习业务相关数据"""
    # 1. 创建学生
    student = Student(id="s1", name="Student 1", phone="13800138000", grade=1, password="p1")
    db_session.add(student)
    
    # 2. 创建教材和单元
    textbook = Textbook(id=1, subject="English", version="PEP", grade=1, semester="First", file="", index_file_id="")
    unit = Unit(id=1, textbook_id=1, name="Unit 1")
    db_session.add_all([textbook, unit])
    
    # 3. 创建题目
    q1 = Question(id="q1", textbook_id=1, unit_id=1, content="Question 1", answer="A", subject="English", grade=1, type="choice", subtype="single", options="[]", difficulty="Easy", knowledge="K1")
    q2 = Question(id="q2", textbook_id=1, unit_id=1, content="Question 2", answer="B", subject="English", grade=1, type="choice", subtype="single", options="[]", difficulty="Easy", knowledge="K2")
    db_session.add_all([q1, q2])
    
    # 4. 创建练习会话
    session = PracticeSession(
        student_id="s1",
        session_type="unit_practice",
        target_id=1,
        textbook_id=1,
        question_count=2,
        status=0,
        generate_status=1
    )
    db_session.add(session)
    await db_session.commit()
    
    # 5. 创建会话题目关联 (通过 PracticeAnswer 预置)
    a1 = PracticeAnswer(session_id=session.id, question_id="q1", student_id="s1", question_order=1)
    a2 = PracticeAnswer(session_id=session.id, question_id="q2", student_id="s1", question_order=2)
    db_session.add_all([a1, a2])
    await db_session.commit()
    
    return {"student": student, "session": session, "questions": [q1, q2]}

@pytest.mark.asyncio
async def test_begin_practice(db_session, seeded_data):
    """测试开始练习"""
    session = seeded_data["session"]
    student = seeded_data["student"]
    
    await practice_service.begin_practice(db_session, student.id, session.id)
    
    # 验证状态
    await db_session.refresh(session)
    assert session.status == 1
    assert session.start_time > 0

@pytest.mark.asyncio
async def test_get_session_detail(db_session, seeded_data):
    """测试获取会话详情"""
    session = seeded_data["session"]
    student = seeded_data["student"]
    
    result = await practice_service.get_session_detail(db_session, student.id, session.id)
    
    assert "session" in result
    assert result["session"].id == session.id
    assert len(result["questions"]) == 2
    assert result["questions"][0].id == "q1"

@pytest.mark.asyncio
async def test_complete_practice(db_session, seeded_data):
    """测试完成练习"""
    session = seeded_data["session"]
    student = seeded_data["student"]
    
    # 模拟已答题
    stmt = select(PracticeAnswer).where(PracticeAnswer.session_id == session.id)
    answers = (await db_session.scalars(stmt)).all()
    for ans in answers:
        ans.status = 1
        ans.time_spent = 10
    
    # 必须更新 session 中的统计字段，因为 complete_practice 依赖这些
    session.answer_count = 2
    session.correct_count = 2
    await db_session.commit()
    
    report_id = await practice_service.complete_practice(db_session, student.id, session.id)
    
    assert report_id is not None
    
    # 验证 session 状态
    await db_session.refresh(session)
    assert session.status == 2
    
    # 验证报告
    report = await db_session.get(PracticeReport, report_id)
    assert report is not None
    assert report.session_id == session.id
    assert report.correct_questions == 2
    assert report.total_questions == 2
