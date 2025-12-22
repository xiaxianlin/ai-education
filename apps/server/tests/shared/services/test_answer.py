import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch
from shared.services import answer as answer_service
from shared.core.database import Question
from shared.core.schema import AnswerAnalysisSchema

@pytest.mark.asyncio
async def test_analyze_text_answer(mock_aliyun_provider):
    """测试文本答案分析"""
    # Mock LLM 返回的字典
    mock_result = {
        "text": "Hello world",
        "match": True,
        "analysis": "Correct expression."
    }
    
    # 使用 return_value 确保调用时返回结果
    mock_aliyun_provider.invoke_chain.return_value = mock_result
    
    question = Question(id="q1", content="Say hello", answer="Hello")
    
    # Mock PromptService.get_answer_analyze_prompt
    with patch("shared.services.prompt.PromptService.get_answer_analyze_prompt", new_callable=AsyncMock) as mock_get_prompt:
        mock_get_prompt.return_value = MagicMock()
        
        result = await answer_service.analyze_text_answer(question, "Hello world")
        
        assert isinstance(result, AnswerAnalysisSchema)
        assert result.match is True
        assert result.text == "Hello world"
        assert result.analysis == "Correct expression."

@pytest.mark.asyncio
async def test_analyze_audio_answer(mock_aliyun_provider):
    """测试语音答案分析"""
    # Mock MultiModalConversation.call
    mock_output = MagicMock()
    mock_output.choices = [
        MagicMock(message=MagicMock(content=[{"text": json.dumps({
            "text": "I am a student",
            "match": True,
            "analysis": "Good job!"
        })}]))
    ]
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.output = mock_output
    
    # 模拟 get_provider_client 返回一个类/对象，它有 call 方法
    mock_client = MagicMock()
    mock_client.call.return_value = mock_response
    mock_aliyun_provider.get_provider_client.return_value = mock_client
    mock_aliyun_provider.api_key = "test_api_key"
    
    question = Question(id="q2", content="Introduce yourself", answer="I am ...")
    audio_url = "http://example.com/test.webm"
    
    result = await answer_service.analyze_audio_answer(question, audio_url)
    
    assert result.match is True
    assert result.text == "I am a student"
    assert result.audio_url == audio_url
    assert result.analysis == "Good job!"
