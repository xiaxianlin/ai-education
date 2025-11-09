"""
AliyunAIService 单元测试
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from ai.services.aliyun import AliyunAIService


class TestAliyunAIService:
    """AliyunAIService 测试类"""

    @patch("ai.services.aliyun.dashscope.MultiModalConversation.call")
    @patch("ai.services.aliyun.envs")
    def test_asr_success(self, mock_envs, mock_call):
        """测试 ASR 成功场景"""
        # 准备 mock 数据
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        # 创建 mock response 对象
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.code = "Success"
        mock_response.request_id = "test_request_id"
        mock_response.output.choices = [
            Mock(
                message=Mock(
                    content=Mock(text="这是识别出的文本内容")
                )
            )
        ]
        mock_call.return_value = mock_response

        # 执行测试
        result = AliyunAIService.asr("https://example.com/audio.mp3", language="zh")

        # 验证结果
        assert result == "这是识别出的文本内容"
        mock_call.assert_called_once_with(
            api_key="test_api_key",
            model="qwen3-asr-flash",
            messages=[{"role": "user", "content": [{"audio": "https://example.com/audio.mp3"}]}],
            result_format="message",
            asr_options={"language": "zh", "enable_itn": True},
        )

    @patch("ai.services.aliyun.dashscope.MultiModalConversation.call")
    @patch("ai.services.aliyun.envs")
    def test_asr_failure(self, mock_envs, mock_call):
        """测试 ASR 失败场景"""
        # 准备 mock 数据
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        # 创建失败的 mock response
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.code = "InvalidParameter"
        mock_response.request_id = "test_request_id"
        mock_response.message = "无效的参数"
        mock_call.return_value = mock_response

        # 验证抛出异常
        with pytest.raises(ValueError) as exc_info:
            AliyunAIService.asr("https://example.com/audio.mp3", language="zh")
        
        assert "任务 ID：test_request_id" in str(exc_info.value)
        assert "错误信息：无效的参数" in str(exc_info.value)

    @patch("ai.services.aliyun.dashscope.MultiModalConversation.call")
    @patch("ai.services.aliyun.envs")
    def test_asr_default_language(self, mock_envs, mock_call):
        """测试 ASR 使用默认语言参数"""
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.code = "Success"
        mock_response.request_id = "test_request_id"
        mock_response.output.choices = [
            Mock(
                message=Mock(
                    content=Mock(text="识别文本")
                )
            )
        ]
        mock_call.return_value = mock_response

        # 不传 language 参数，应该使用默认值 "zh"
        AliyunAIService.asr("https://example.com/audio.mp3")

        # 验证调用时使用了默认语言
        call_args = mock_call.call_args
        assert call_args[1]["asr_options"]["language"] == "zh"

    @patch("ai.services.aliyun.dashscope.MultiModalConversation.call")
    @patch("ai.services.aliyun.envs")
    def test_tts_success(self, mock_envs, mock_call):
        """测试 TTS 成功场景"""
        # 准备 mock 数据
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        # 创建 mock response 对象
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.code = "Success"
        mock_response.request_id = "test_request_id"
        mock_response.output.audio.url = "https://example.com/audio.mp3"
        mock_call.return_value = mock_response

        # 执行测试
        result = AliyunAIService.tts("Hello world", voice="Cherry", language="English")

        # 验证结果
        assert result == "https://example.com/audio.mp3"
        mock_call.assert_called_once_with(
            api_key="test_api_key",
            model="qwen3-tts-flash",
            text="Hello world",
            voice="Cherry",
            language_type="English",
            stream=False,
        )

    @patch("ai.services.aliyun.dashscope.MultiModalConversation.call")
    @patch("ai.services.aliyun.envs")
    def test_tts_failure(self, mock_envs, mock_call):
        """测试 TTS 失败场景"""
        # 准备 mock 数据
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        # 创建失败的 mock response
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.code = "InvalidParameter"
        mock_response.request_id = "test_request_id"
        mock_response.message = "Field required: input.text"
        mock_call.return_value = mock_response

        # 验证抛出异常
        with pytest.raises(ValueError) as exc_info:
            AliyunAIService.tts("Hello world", voice="Cherry", language="English")
        
        assert "任务 ID：test_request_id" in str(exc_info.value)
        assert "错误信息：Field required: input.text" in str(exc_info.value)

    @patch("ai.services.aliyun.dashscope.MultiModalConversation.call")
    @patch("ai.services.aliyun.envs")
    def test_tts_default_parameters(self, mock_envs, mock_call):
        """测试 TTS 使用默认参数"""
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.code = "Success"
        mock_response.request_id = "test_request_id"
        mock_response.output.audio.url = "https://example.com/audio.mp3"
        mock_call.return_value = mock_response

        # 使用默认参数
        AliyunAIService.tts("测试文本")

        # 验证调用时使用了默认值
        call_args = mock_call.call_args
        assert call_args[1]["voice"] == "Cherry"
        assert call_args[1]["language_type"] == "English"

    @patch("ai.services.aliyun.dashscope.ImageSynthesis.call")
    @patch("ai.services.aliyun.envs")
    def test_generate_image_success(self, mock_envs, mock_call):
        """测试图片生成成功场景"""
        # 准备 mock 数据
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        # 创建 mock response 对象
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.code = "Success"
        mock_response.request_id = "test_request_id"
        mock_response.output.choices = [
            Mock(
                message=Mock(
                    content=Mock(image="https://example.com/image.png")
                )
            )
        ]
        mock_call.return_value = mock_response

        # 执行测试
        result = AliyunAIService.generate_image("一只可爱的小猫", width=1024, height=1024)

        # 验证结果
        assert result == "https://example.com/image.png"
        mock_call.assert_called_once_with(
            api_key="test_api_key",
            model="qwen-image-plus",
            prompt="一只可爱的小猫",
            result_format="message",
            stream=False,
            size="1024*1024",
        )

    @patch("ai.services.aliyun.dashscope.ImageSynthesis.call")
    @patch("ai.services.aliyun.envs")
    def test_generate_image_without_size(self, mock_envs, mock_call):
        """测试图片生成不指定尺寸"""
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.code = "Success"
        mock_response.request_id = "test_request_id"
        mock_response.output.choices = [
            Mock(
                message=Mock(
                    content=Mock(image="https://example.com/image.png")
                )
            )
        ]
        mock_call.return_value = mock_response

        # 不指定尺寸
        AliyunAIService.generate_image("一只可爱的小猫")

        # 验证调用时 size 为 None
        call_args = mock_call.call_args
        assert call_args[1]["size"] is None

    @patch("ai.services.aliyun.dashscope.ImageSynthesis.call")
    @patch("ai.services.aliyun.envs")
    def test_generate_image_failure(self, mock_envs, mock_call):
        """测试图片生成失败场景"""
        # 准备 mock 数据
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        # 创建失败的 mock response
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.code = "InvalidParameter"
        mock_response.request_id = "test_request_id"
        mock_response.message = "无效的提示词"
        mock_call.return_value = mock_response

        # 验证抛出异常
        with pytest.raises(ValueError) as exc_info:
            AliyunAIService.generate_image("无效提示词", width=1024, height=1024)
        
        assert "任务 ID：test_request_id" in str(exc_info.value)
        assert "错误信息：无效的提示词" in str(exc_info.value)

    @patch("ai.services.aliyun.dashscope.ImageSynthesis.call")
    @patch("ai.services.aliyun.envs")
    def test_generate_image_partial_size(self, mock_envs, mock_call):
        """测试图片生成只指定一个尺寸参数"""
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.code = "Success"
        mock_response.request_id = "test_request_id"
        mock_response.output.choices = [
            Mock(
                message=Mock(
                    content=Mock(image="https://example.com/image.png")
                )
            )
        ]
        mock_call.return_value = mock_response

        # 只指定 width，不指定 height
        AliyunAIService.generate_image("测试", width=1024)

        # 验证调用时 size 为 None（因为 width 和 height 都需要指定）
        call_args = mock_call.call_args
        assert call_args[1]["size"] is None

    @patch("ai.services.aliyun.dashscope.MultiModalConversation.call")
    @patch("ai.services.aliyun.envs")
    def test_asr_status_code_200_but_code_not_success(self, mock_envs, mock_call):
        """测试 ASR status_code 为 200 但 code 不是 Success 的情况"""
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.code = None  # code 为空
        mock_response.request_id = "test_request_id"
        mock_response.message = "内部错误"
        mock_call.return_value = mock_response

        # 验证抛出异常
        with pytest.raises(ValueError) as exc_info:
            AliyunAIService.asr("https://example.com/audio.mp3")
        
        assert "任务 ID：test_request_id" in str(exc_info.value)
        assert "错误信息：内部错误" in str(exc_info.value)

    @patch("ai.services.aliyun.dashscope.ImageSynthesis.call")
    @patch("ai.services.aliyun.envs")
    def test_generate_image_status_code_200_but_code_not_success(self, mock_envs, mock_call):
        """测试图片生成 status_code 为 200 但 code 不是 Success 的情况"""
        mock_envs.AI_PLATFORM_KEY = "test_api_key"
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.code = None  # code 为空
        mock_response.request_id = "test_request_id"
        mock_response.message = "生成失败"
        mock_call.return_value = mock_response

        # 验证抛出异常
        with pytest.raises(ValueError) as exc_info:
            AliyunAIService.generate_image("测试")
        
        assert "任务 ID：test_request_id" in str(exc_info.value)
        assert "错误信息：生成失败" in str(exc_info.value)

