"""
Provider 模块测试文件
"""

import asyncio
import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from . import get_provider, get_available_providers
from .exceptions import ProviderError, ProviderNotSupportedError


async def test_provider():
    """测试 Provider 基本功能"""
    print("=== Provider 模块测试 ===\n")
    
    # 测试可用的 Provider
    available_providers = get_available_providers()
    print(f"可用的 Provider: {available_providers}")
    
    try:
        # 获取 Provider 实例
        provider = get_provider()
        print(f"成功创建 Provider: {provider.get_name()}")
        
        # 测试获取客户端
        openai_client = provider.get_openai_client()
        print("✓ 获取 OpenAI 客户端成功")
        
        langchain_client = provider.get_langchain_client()
        print("✓ 获取 LangChain 客户端成功")
        
        provider_client = provider.get_provider_client()
        if provider_client:
            print("✓ 获取平台原生客户端成功")
        else:
            print("⚠ 平台原生客户端为 None")
        
        print("\n=== 开始功能测试 ===\n")
        
        # 测试文本生成
        try:
            result = await provider.invoke_text_generate(
                "请简单介绍一下人工智能",
                max_tokens=100
            )
            print(f"✓ 文本生成测试成功: {result[:50]}...")
        except Exception as e:
            print(f"✗ 文本生成测试失败: {e}")
        
        # 测试 LangChain 链式调用
        try:
            prompt = ChatPromptTemplate.from_template("请用一句话概括: {topic}")
            parser = StrOutputParser()
            result = await provider.invoke_chain(
                prompt=prompt,
                inputs={"topic": "机器学习"},
                parser=parser
            )
            print(f"✓ 链式调用测试成功: {result}")
        except Exception as e:
            print(f"✗ 链式调用测试失败: {e}")
        
        # 测试图片生成（可能失败，因为需要额外配置）
        try:
            result = await provider.invoke_image_generate(
                "一只可爱的小猫",
                width=512,
                height=512
            )
            print(f"✓ 图片生成测试成功: {result}")
        except ProviderNotSupportedError as e:
            print(f"⚠ 图片生成不支持: {e}")
        except Exception as e:
            print(f"✗ 图片生成测试失败: {e}")
        
        # 测试语音合成（可能失败，因为需要额外配置）
        try:
            result = await provider.invoke_tts(
                "你好，这是一个测试",
                voice="Cherry",
                language="Chinese"
            )
            print(f"✓ 语音合成测试成功: {type(result)}")
        except ProviderNotSupportedError as e:
            print(f"⚠ 语音合成不支持: {e}")
        except Exception as e:
            print(f"✗ 语音合成测试失败: {e}")
        
        # 测试视频生成（应该失败，因为当前不支持）
        try:
            result = await provider.invoke_video_generate("测试视频")
            print(f"✓ 视频生成测试成功: {result}")
        except ProviderNotSupportedError as e:
            print(f"⚠ 视频生成不支持（预期）: {e}")
        except Exception as e:
            print(f"✗ 视频生成测试失败: {e}")
        
        # 测试语音识别（跳过，因为需要音频文件）
        print("⚠ 跳过语音识别测试（需要音频文件）")
        
        print("\n=== 测试完成 ===")
        
    except Exception as e:
        print(f"✗ Provider 创建失败: {e}")
        print("请检查环境配置是否正确")


def test_import():
    """测试模块导入"""
    print("=== 导入测试 ===")
    
    try:
        from . import BaseProvider, AliyunProvider, OpenAIProvider
        print("✓ 基类导入成功")
        
        from .exceptions import ProviderError, ProviderNotSupportedError, ProviderConfigError
        print("✓ 异常类导入成功")
        
        from . import get_provider, register_provider, get_available_providers
        print("✓ 工厂函数导入成功")
        
        print("✓ 所有导入测试通过\n")
        
    except Exception as e:
        print(f"✗ 导入测试失败: {e}\n")


if __name__ == "__main__":
    # 设置环境变量（仅用于测试）
    os.environ.setdefault("AI_PLATFORM", "aliyun")
    os.environ.setdefault("AI_PLATFORM_KEY", "test-key")
    os.environ.setdefault("AI_PLATFORM_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
    
    # 运行测试
    test_import()
    asyncio.run(test_provider())
