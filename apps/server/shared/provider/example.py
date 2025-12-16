"""
Provider 模块使用示例

展示如何在现有代码中集成和使用 Provider 模块
"""

import asyncio
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from . import get_provider


async def example_text_generation():
    """文本生成示例"""
    print("=== 文本生成示例 ===")
    
    provider = get_provider()
    
    result = await provider.invoke_text_generate(
        "请用简单的话解释什么是机器学习",
        max_tokens=150,
        temperature=0.7
    )
    
    print(f"生成结果: {result}")
    return result


async def example_chain_call():
    """LangChain 链式调用示例"""
    print("\n=== LangChain 链式调用示例 ===")
    
    provider = get_provider()
    
    # 创建提示词模板
    prompt = ChatPromptTemplate.from_template(
        """你是一名小学数学老师，请为以下题目生成简单易懂的解析。

题目: {question}
难度: {difficulty}

请按照以下格式输出：
1. 解题思路：
2. 详细步骤：
3. 最终答案："""
    )
    
    # 创建输出解析器（如果需要结构化输出）
    parser = JsonOutputParser()
    
    # 执行链式调用
    result = await provider.invoke_chain(
        prompt=prompt,
        inputs={
            "question": "小明有5个苹果，小红比小明多3个，小红有多少个苹果？",
            "difficulty": "简单"
        }
        # 如果需要结构化输出，添加: parser=parser
    )
    
    print(f"解析结果: {result}")
    return result


async def example_image_generation():
    """图片生成示例"""
    print("\n=== 图片生成示例 ===")
    
    provider = get_provider()
    
    # 为数学题目生成配图
    image_prompt = """
    卡通风格，简单的数学题目配图。
    画面中左边有5个红苹果，右边有8个绿苹果，背景简洁明亮。
    适合小学生理解，色彩鲜艳。
    """
    
    try:
        image_url = await provider.invoke_image_generate(
            prompt=image_prompt,
            width=512,
            height=512,
            negative_prompt="复杂背景，写实风格"
        )
        
        print(f"图片生成成功: {image_url}")
        return image_url
        
    except Exception as e:
        print(f"图片生成失败: {e}")
        return None


async def example_tts():
    """语音合成示例"""
    print("\n=== 语音合成示例 ===")
    
    provider = get_provider()
    
    # 为题目生成语音朗读
    text = "小明有5个苹果，小红比小明多3个，小红有多少个苹果？"
    
    try:
        audio_url = await provider.invoke_tts(
            text=text,
            voice="Cherry",
            language="Chinese"
        )
        
        print(f"语音合成成功: {audio_url}")
        return audio_url
        
    except Exception as e:
        print(f"语音合成失败: {e}")
        return None


async def example_migration():
    """迁移现有代码示例"""
    print("\n=== 迁移现有代码示例 ===")
    
    provider = get_provider()
    
    # 原来的代码：
    # from ai.utils.llm import get_chat_client
    # client = get_chat_client()
    # result = client.invoke("...")
    
    # 迁移后的代码：
    result = await provider.invoke_text_generate(
        "请介绍一下人工智能的发展历史",
        max_tokens=200
    )
    
    print(f"迁移后的调用结果: {result}")
    
    # 或者保持 LangChain 调用方式：
    from langchain_core.prompts import ChatPromptTemplate
    
    prompt = ChatPromptTemplate.from_template("请解释: {concept}")
    result = await provider.invoke_chain(
        prompt=prompt,
        inputs={"concept": "深度学习"}
    )
    
    print(f"LangChain 调用结果: {result}")


async def example_error_handling():
    """错误处理示例"""
    print("\n=== 错误处理示例 ===")
    
    provider = get_provider()
    
    try:
        # 尝试不支持的功能
        await provider.invoke_video_generate("测试视频")
    except Exception as e:
        print(f"捕获到预期异常: {e}")
    
    try:
        # 模拟网络错误（使用错误的 API 密钥）
        wrong_provider = get_provider(api_key="wrong-key")
        await wrong_provider.invoke_text_generate("测试")
    except Exception as e:
        print(f"捕获到 API 错误: {e}")


async def main():
    """主函数 - 运行所有示例"""
    print("Provider 模块使用示例\n")
    
    try:
        # 基础功能示例
        await example_text_generation()
        await example_chain_call()
        
        # 多模态功能示例
        await example_image_generation()
        await example_tts()
        
        # 迁移示例
        await example_migration()
        
        # 错误处理示例
        await example_error_handling()
        
        print("\n=== 所有示例运行完成 ===")
        
    except Exception as e:
        print(f"示例运行出错: {e}")


if __name__ == "__main__":
    # 运行示例
    asyncio.run(main())
