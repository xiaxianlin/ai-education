import json
from typing import List, Dict, Any
from ai.models.factory import ModelFactory
from core import get_logger


logger = get_logger("AIQuestionGenerator")


class AIQuestionGenerator:
    """AI问题生成器"""
    
    def __init__(self):
        self.llm_model = ModelFactory.get_llm_provider()
    
    async def generate_questions(
        self,
        subject: str,
        grade: int,
        knowledge_content: str,
        unit_content: str = "",
        question_types: List[str] = None,
        count: int = 5,
        difficulty: str = "中等"
    ) -> List[Dict[str, Any]]:
        """生成问题"""
        
        if question_types is None:
            question_types = ["单选", "填空", "解答"]
        
        # 构建生成提示词
        prompt = self._build_generation_prompt(
            subject, grade, knowledge_content, unit_content, 
            question_types, count, difficulty
        )
        
        messages = [
            {"role": "system", "content": self._get_system_prompt(subject)},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = await self.llm_model.chat(messages)
            questions = self._parse_response(response)
            
            # 验证和清理问题
            valid_questions = []
            for question in questions:
                if self._validate_question(question):
                    valid_questions.append(question)
            
            logger.info(f"Generated {len(valid_questions)} valid questions out of {len(questions)}")
            return valid_questions[:count]  # 确保不超过请求数量
            
        except Exception as e:
            logger.error(f"Error generating questions: {str(e)}")
            return []
    
    def _get_system_prompt(self, subject: str) -> str:
        """获取系统提示词"""
        prompts = {
            "数学": "你是一个专业的数学教师，擅长根据知识点生成高质量的数学题目。你生成的题目应该有明确的解题思路和标准答案。",
            "语文": "你是一个专业的语文教师，擅长根据课文内容和知识点生成语文练习题。你的题目应该注重语言文字运用和理解能力。",
            "英语": "你是一个专业的英语教师，擅长根据语法点和词汇生成英语练习题。你的题目应该注重语言运用和交际能力。",
            "物理": "你是一个专业的物理教师，擅长根据物理概念和定律生成物理题目。你的题目应该有清晰的物理情境和解题步骤。",
            "化学": "你是一个专业的化学教师，擅长根据化学原理生成化学题目。你的题目应该结合实际应用场景。",
            "生物": "你是一个专业的生物教师，擅长根据生物知识点生成生物题目。你的题目应该联系生活实际。"
        }
        
        return prompts.get(subject, f"你是一个专业的{subject}教师，擅长根据知识点生成高质量的练习题目。")
    
    def _build_generation_prompt(
        self,
        subject: str,
        grade: int,
        knowledge_content: str,
        unit_content: str,
        question_types: List[str],
        count: int,
        difficulty: str
    ) -> str:
        """构建生成提示词"""
        
        type_instructions = {
            "单选": "单项选择题，提供4个选项(A/B/C/D)，只有一个正确答案",
            "多选": "多项选择题，提供4个选项(A/B/C/D)，有多个正确答案",
            "填空": "填空题，在题目中用下划线标出空白处",
            "判断": "判断题，要求判断对错并说明理由",
            "解答": "解答题，需要完整的解题过程和步骤",
            "计算": "计算题，需要数值计算和公式运用"
        }
        
        difficulty_desc = {
            "简单": "基础概念理解，适合初学者",
            "中等": "知识点综合运用，有一定思维要求",
            "困难": "知识点深度应用，需要较强分析能力"
        }
        
        prompt = f"""
请根据以下信息生成{count}道{subject}练习题：

**基本信息：**
- 科目：{subject}
- 年级：{grade}年级
- 难度：{difficulty}（{difficulty_desc.get(difficulty, '')}）

**知识点内容：**
{knowledge_content}

**单元内容：**
{unit_content}

**题目要求：**
- 题目类型：{', '.join(question_types)}
- 数量：{count}道题
- 每种类型的具体要求：
"""
        
        for qtype in question_types:
            if qtype in type_instructions:
                prompt += f"  - {qtype}：{type_instructions[qtype]}\n"
        
        prompt += f"""
**输出格式：**
请以JSON数组格式返回，每道题包含以下字段：
```json
[
  {{
    "type": "题目类型",
    "content": "题目内容",
    "options": ["选项A", "选项B", "选项C", "选项D"],  // 仅选择题需要
    "answer": "正确答案或答案解析",
    "analysis": "题目解析和解题思路"
  }}
]
```

**注意事项：**
1. 题目内容要准确、完整，符合{grade}年级学生水平
2. 选择题的选项要合理，避免明显错误选项
3. 答案要准确，解析要清晰
4. 题目要有一定的实用性和教育意义
5. 避免过于复杂或过于简单的题目

请开始生成题目：
"""
        
        return prompt
    
    def _parse_response(self, response: str) -> List[Dict[str, Any]]:
        """解析AI响应"""
        try:
            # 提取JSON部分
            start_idx = response.find('[')
            end_idx = response.rfind(']') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response[start_idx:end_idx]
                questions = json.loads(json_str)
                
                if isinstance(questions, list):
                    return questions
            
            logger.warning("Could not extract valid JSON from AI response")
            return []
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {str(e)}")
            return []
    
    def _validate_question(self, question: Dict[str, Any]) -> bool:
        """验证问题格式"""
        required_fields = ['type', 'content', 'answer']
        
        # 检查必需字段
        for field in required_fields:
            if field not in question or not question[field]:
                logger.warning(f"Question missing required field: {field}")
                return False
        
        # 检查选择题是否有选项
        if question['type'] in ['单选', '多选'] and 'options' not in question:
            logger.warning("Choice question missing options")
            return False
        
        # 基本内容长度检查
        if len(question['content']) < 10:
            logger.warning("Question content too short")
            return False
        
        return True