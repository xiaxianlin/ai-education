from typing import Any, List, NotRequired, Optional, TypedDict

from pydantic import BaseModel, Field
from shared.core.database import Question, QuestionType
from sqlalchemy.ext.asyncio import AsyncSession


class GeneratedQuestion(BaseModel):
    """生成的题目模型 - 直接对应 Question 模型"""

    stem: dict = Field(
        description=(
            "题干结构，包含以下字段："
            "text (str, 必填): 纯文本题干；"
            "rich_text (str, 可选): 富文本题干（HTML格式）；"
            "highlight_words (List[str], 可选): 需要高亮的词汇列表；"
            "hints (List[str], 可选): 提示信息列表；"
            "sub_questions (List[dict], 可选): 子题列表（用于复合题/应用题），"
            "每个子题包含 id, order, stem, interaction_type, options, resources, answer, explanation 等字段"
        )
    )
    options: Optional[List[dict]] = Field(
        description=(
            "选项列表（选择题使用），每个选项包含以下字段："
            "id (str, 必填): 选项ID，如 'A'/'B'/'C'/'D'；"
            "text (str, 可选): 选项文本内容；"
            "is_correct (bool, 必填): 是否为正确答案；"
            "feedback (str, 可选): 选择该选项后的反馈信息"
        ),
        default=None,
    )
    blanks: Optional[List[dict]] = Field(
        description=(
            "填空位置配置（填空题使用），每个填空项包含以下字段："
            "id (str, 必填): 填空位置ID，如 'blank_1'/'blank_2'；"
            "position (int, 必填): 在题干文本中的位置索引；"
            "length (int, 可选): 填空长度（字符数）；"
            "correct_answer (str, 可选): 该位置的正确答案；"
            "accept_answers (List[str], 可选): 可接受的答案列表；"
            "hint (str, 可选): 该填空的提示信息"
        ),
        default=None,
    )
    resources: Optional[List[dict]] = Field(
        description=(
            "资源列表（包含题干资源和选项资源），每个资源包含以下字段："
            "id (str, 必填): 资源ID；"
            "resource_type (str, 必填): 资源归属类型，可选值：'stem'（题干资源）/'option'（选项资源）；"
            "type (str, 必填): 资源类型；"
            "position (str, 可选): 位置标识，向后兼容字段，可选值：'stem'/'option'/'background'；"
            "根据 resource_type 和 type，需要生成以下内容："
            "【题干资源（resource_type='stem'）】："
            "- type='none' 或 'text': 不需要生成额外的资源内容字段；"
            "- type='image': 需要生成 image_prompt (str, 必填) 字段，用于图片生成的提示词，"
            "描述要生成的图片内容，要求简洁清晰、适合低年级学生认知水平、使用卡通插画风格；"
            "- type='audio': 需要生成 text (str, 必填) 字段，用于TTS语音合成的文本内容；"
            "- type='video': 需要生成 video_prompt (str, 必填) 字段，用于视频生成的提示词；"
            "- type='animation': 需要生成 animation_prompt (str, 必填) 字段，用于动画生成的提示词；"
            "【选项资源（resource_type='option'）】："
            "- 必须包含 option_id (str, 必填) 字段，关联到对应选项的ID（如 'A'/'B'/'C'/'D'）；"
            "- type='image': 需要生成 image_prompt (str, 必填) 字段，用于图片生成的提示词；"
            "- type='audio': 需要生成 text (str, 必填) 字段，用于TTS语音合成的文本内容；"
            "- 选项资源只支持 'image' 和 'audio' 两种类型"
        ),
        default=None,
    )
    answer: dict = Field(
        description=(
            "答案配置，包含以下字段："
            "type (str, 必填): 答案类型，可选值：'exact'（精确匹配）/'fuzzy'（模糊匹配）/"
            "'rubric'（评分标准）/'ai'（AI评分）/'composite'（复合答案）；"
            "correct_answers (List[str], 可选): 正确答案列表，如 ['A'] 或 ['北京', 'Beijing']；"
            "accept_answers (List[str], 可选): 可接受的答案列表（用于模糊匹配）；"
            "scoring (dict, 可选): 评分规则配置；"
            "rubric (dict, 可选): 评分标准（主观题使用）"
        )
    )
    explanation: Optional[str] = Field(description="题目解析文本，用于解释答案或解题思路", default=None)
    difficulty: str = Field(description="题目难度，可选值：'easy'（简单）/'medium'（中等）/'hard'（困难）")
    cognitive_level: Optional[str] = Field(
        description="认知层次，可选值：'remember'（识记）/'understand'（理解）/'apply'（应用）/"
        "'analyze'（分析）/'evaluate'（评价）/'create'（创造）",
        default=None,
    )
    knowledge_points: Optional[List[str]] = Field(
        description="知识点列表，字符串数组，如 ['拼音', '看图识字']", default=None
    )
    ability_tags: Optional[List[str]] = Field(
        description="能力标签列表，字符串数组，如 ['识记能力', '理解能力']", default=None
    )


class QuestionGenerationResult(BaseModel):
    """题目生成结果模型 - LLM 返回的 JSON 结构"""

    questions: List[GeneratedQuestion] = Field(description="生成的题目列表")


class QuestionGenerationState(TypedDict, total=False):
    """题目生成流程的状态"""

    # ================= 外部传入状态 ================== #
    # 数据库会话
    db: AsyncSession
    # 题目类型编码
    question_type_code: str
    # 需要生成的数量
    count: int
    # 题目类型对象
    question_type: NotRequired[QuestionType]

    # ================= 内部构建状态 ================== #
    # 生成的提示词 (ChatPromptTemplate)
    prompt: NotRequired[Any]
    # prompt 输入参数（用于格式化 prompt）
    prompt_input: NotRequired[dict[str, Any]]
    # JSON 输出解析器
    prompt_parser: NotRequired[Any]
    # 题目对象列表（用于存储最终要保存的题目）
    questions: NotRequired[List[Question]]
