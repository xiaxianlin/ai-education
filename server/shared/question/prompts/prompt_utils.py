"""通用Prompt构建工具函数

本模块提供可复用的prompt构建辅助函数,用于消除代码重复并提高一致性。
"""

from typing import List, Optional
from core.database import Question


def build_knowledge_text(knowledges: List[str]) -> str:
    """构建知识点文本列表
    
    Args:
        knowledges: 知识点名称列表
        
    Returns:
        格式化的知识点文本,每行一个知识点,以"- "开头
        如果列表为空,返回默认提示文本
        
    Examples:
        >>> build_knowledge_text(["加法", "减法"])
        '- 加法\\n- 减法'
        >>> build_knowledge_text([])
        '暂无知识点信息'
    """
    if not knowledges:
        return "暂无知识点信息"
    
    knowledge_lines = [f"- {knowledge}" for knowledge in knowledges]
    return "\n".join(knowledge_lines)


def build_subtype_info(question_types: List[str]) -> str:
    """构建题型子类型信息
    
    Args:
        question_types: 题型列表(如["选择题", "填空题"])
        
    Returns:
        格式化的题型子类型说明文本
        格式: "题型：子类型1、子类型2"
        如果没有子类型,返回"无子类型要求"
        
    Examples:
        >>> build_subtype_info(["选择题"])
        '选择题：单选、多选'
    """
    from core.constants import get_question_subtypes
    
    subtype_info_lines = []
    for qtype in question_types:
        subtypes = get_question_subtypes(qtype)
        if subtypes:
            subtype_info_lines.append(f"{qtype}：{'、'.join(subtypes)}")
    
    return "\n".join(subtype_info_lines) if subtype_info_lines else "无子类型要求"


def build_avoid_duplicate_hint(recall_questions: Optional[List[Question]]) -> str:
    """构建避免重复题目的提示信息
    
    Args:
        recall_questions: 已召回的题目列表
        
    Returns:
        格式化的避免重复提示文本
        如果没有召回题目,返回空字符串
        
    Note:
        此函数会列出已召回题目的ID、题干和选项,
        提醒LLM生成全新的、不重复的题目
    """
    if not recall_questions:
        return ""
    
    recalled_questions_info_lines = []
    for recall_question in recall_questions:
        recalled_questions_info_lines.append(
            f"- 题目ID: {recall_question.id}, "
            f"题干: {recall_question.question}, "
            f"选项: {recall_question.options}"
        )
    
    recalled_questions_info = "\n".join(recalled_questions_info_lines)
    
    return (
        f"\n\n## 重要：避免题目重复\n"
        f"以下题目已从数据库召回，请确保生成的题目与这些题目不重复或高度相似：\n"
        f"{recalled_questions_info}\n"
        f"请生成全新的、与上述题目不同的题目。"
    )


def build_difficulty_distribution(
    count: int,
    simple_ratio: float = 0.3,
    medium_ratio: float = 0.5,
    hard_ratio: float = 0.2
) -> dict:
    """计算题目难度分布
    
    Args:
        count: 总题目数量
        simple_ratio: 简单题比例(默认30%)
        medium_ratio: 普通题比例(默认50%)
        hard_ratio: 困难题比例(默认20%)
        
    Returns:
        包含各难度题目数量的字典
        {
            'simple_count': int,
            'medium_count': int,
            'hard_count': int
        }
        
    Note:
        确保三个比例之和为1.0
        实际数量会根据总数调整,确保总和等于count
    """
    if abs(simple_ratio + medium_ratio + hard_ratio - 1.0) > 0.01:
        raise ValueError("难度比例之和必须为1.0")
    
    simple_count = max(1, int(count * simple_ratio))
    medium_count = max(1, int(count * medium_ratio))
    hard_count = count - simple_count - medium_count
    
    return {
        'simple_count': simple_count,
        'medium_count': medium_count,
        'hard_count': hard_count
    }


def build_question_distribution(
    count: int,
    wrong_ratio: float = 0.3,
    consolidation_ratio: float = 0.4,
    challenge_ratio: float = 0.2,
    new_ratio: float = 0.1
) -> dict:
    """计算今日练习题目类型分布
    
    Args:
        count: 总题目数量
        wrong_ratio: 错题复习比例(默认30%)
        consolidation_ratio: 巩固练习比例(默认40%)
        challenge_ratio: 挑战题比例(默认20%)
        new_ratio: 新知引入比例(默认10%)
        
    Returns:
        包含各类型题目数量的字典
        {
            'wrong_count': int,
            'consolidation_count': int,
            'challenge_count': int,
            'new_count': int
        }
    """
    if abs(wrong_ratio + consolidation_ratio + challenge_ratio + new_ratio - 1.0) > 0.01:
        raise ValueError("题目类型比例之和必须为1.0")
    
    wrong_count = max(1, int(count * wrong_ratio))
    consolidation_count = int(count * consolidation_ratio)
    challenge_count = int(count * challenge_ratio)
    new_count = count - wrong_count - consolidation_count - challenge_count
    
    return {
        'wrong_count': wrong_count,
        'consolidation_count': consolidation_count,
        'challenge_count': challenge_count,
        'new_count': new_count
    }


def build_question_types_text(question_types: List[str]) -> str:
    """构建题型列表文本
    
    Args:
        question_types: 题型列表
        
    Returns:
        用顿号连接的题型文本
        
    Examples:
        >>> build_question_types_text(["选择题", "填空题", "判断题"])
        '选择题、填空题、判断题'
    """
    return "、".join(question_types)


def format_knowledge_list(
    knowledges: List[str],
    max_count: Optional[int] = None,
    separator: str = "、"
) -> str:
    """格式化知识点列表为文本
    
    Args:
        knowledges: 知识点列表
        max_count: 最大显示数量,None表示全部显示
        separator: 分隔符(默认顿号)
        
    Returns:
        格式化的知识点文本
        如果列表为空,返回"（无）"
        
    Examples:
        >>> format_knowledge_list(["加法", "减法", "乘法"], max_count=2)
        '加法、减法'
    """
    if not knowledges:
        return "（无）"
    
    if max_count:
        knowledges = knowledges[:max_count]
    
    return separator.join(knowledges)


def build_system_prompt(role: str, goal: str, format_requirement: str = "") -> str:
    """构建标准的system prompt
    
    Args:
        role: 角色定义(如"专业教研员")
        goal: 目标描述
        format_requirement: 格式要求(可选)
        
    Returns:
        完整的system prompt文本
        
    Examples:
        >>> build_system_prompt(
        ...     "专业教研员",
        ...     "生成高质量题目",
        ...     "请严格按照 {format_instructions} 生成 JSON 输出。"
        ... )
    """
    base_prompt = f"你是一名{role}，{goal}"
    
    if format_requirement:
        return f"{base_prompt}\n{format_requirement}"
    
    return base_prompt


def validate_prompt_params(params: dict, required_keys: List[str]) -> None:
    """验证prompt参数是否完整
    
    Args:
        params: 参数字典
        required_keys: 必需的参数键列表
        
    Raises:
        ValueError: 如果缺少必需参数
    """
    missing_keys = [key for key in required_keys if key not in params or params[key] is None]
    
    if missing_keys:
        raise ValueError(f"缺少必需的prompt参数: {', '.join(missing_keys)}")
