import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy import select
from generation.question.graph import entry_node, call_llm_node, update_questions_node
from shared.core.database import Practice, Textbook, Question
from generation.question.schema import GeneratedQuestion

@pytest.mark.asyncio
async def test_entry_node(db_session):
    """测试入口节点"""
    # 准备数据
    practice = Practice(id=1, slug="daily_practice", name="Daily", type="system", parameters=[])
    textbook = Textbook(id=1, subject="English", version="PEP", grade=1, semester="First", file="", index_file_id="")
    db_session.add_all([practice, textbook])
    await db_session.commit()
    
    state = {
        "db": db_session,
        "slug": "daily_practice",
        "textbook": textbook
    }
    
    result = await entry_node(state)
    
    assert result["practice"].slug == "daily_practice"
    assert "practice_config" in result
    assert result["count"] > 0

@pytest.mark.asyncio
async def test_call_llm_node():
    """测试 LLM 调用节点"""
    # 模拟 LLMService.call_llm 返回
    mock_questions = [
        GeneratedQuestion(
            question_type="choice",
            question="Q1",
            answer="A",
            difficulty="Easy",
            knowledge="K1"
        )
    ]
    
    with patch("generation.question.services.llm.LLMService.call_llm", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = mock_questions
        
        state = {} # call_llm_node 只依赖 LLMService
        result = await call_llm_node(state)
        
        assert result["questions"] == mock_questions
        mock_call.assert_awaited_once()

@pytest.mark.asyncio
async def test_update_questions_node(db_session):
    """测试题目更新/汇聚节点"""
    # 准备数据
    q_recall = Question(id="rec1", content="Recall", answer="A", subject="E", grade=1, type="choice", options="[]", difficulty="E", knowledge="K")
    q_gen = Question(id="gen1", content="Gen", answer="B", subject="E", grade=1, type="choice", options="[]", difficulty="E", knowledge="K")
    
    state = {
        "db": db_session,
        "recall_questions": [q_recall],
        "questions": [q_gen]
    }
    
    # 注意：update_questions_node 会执行 db.commit()
    result = await update_questions_node(state)
    
    assert len(result["questions"]) == 2
    assert q_recall in result["questions"]
    assert q_gen in result["questions"]
