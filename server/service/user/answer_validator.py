import re
import json
from typing import Dict, Any, List
from difflib import SequenceMatcher
from core import get_logger


logger = get_logger("AnswerValidator")


class AnswerValidator:
    """答案验证和评分器"""

    def __init__(self):
        self.llm_model = None

    def validate_answer(
        self, question_type: str, user_answer: str, correct_answer: str, question_content: str = ""
    ) -> Dict[str, Any]:
        """验证答案并评分"""

        # 标准化答案格式
        user_answer = self._normalize_answer(user_answer)
        correct_answer = self._normalize_answer(correct_answer)

        if question_type in ["单选", "多选"]:
            return self._validate_choice_answer(user_answer, correct_answer)
        elif question_type == "填空":
            return self._validate_fill_answer(user_answer, correct_answer)
        elif question_type == "判断":
            return self._validate_judgment_answer(user_answer, correct_answer)
        elif question_type in ["解答", "计算"]:
            return self._validate_subjective_answer(user_answer, correct_answer, question_content)
        else:
            # 默认处理
            return self._validate_general_answer(user_answer, correct_answer)

    def _normalize_answer(self, answer: str) -> str:
        """标准化答案格式"""
        if not answer:
            return ""

        # 去除首尾空白
        answer = answer.strip()

        # 统一中英文标点
        replacements = {
            "（": "(",
            "）": ")",
            "，": ",",
            "。": ".",
            "：": ":",
            "；": ";",
            "？": "?",
            "！": "!",
        }

        for old, new in replacements.items():
            answer = answer.replace(old, new)

        return answer

    def _validate_choice_answer(self, user_answer: str, correct_answer: str) -> Dict[str, Any]:
        """验证选择题答案"""
        # 提取选项字母
        user_options = self._extract_options(user_answer)
        correct_options = self._extract_options(correct_answer)

        if user_options == correct_options:
            return {"is_correct": 1, "score": 100, "explanation": "答案正确"}
        else:
            return {
                "is_correct": 0,
                "score": 0,
                "explanation": f"答案错误。正确答案是: {correct_answer}",
            }

    def _extract_options(self, answer: str) -> set:
        """从答案中提取选项字母"""
        # 匹配选项字母 (A, B, C, D等)
        options = re.findall(r"[A-Z]", answer.upper())
        return set(options)

    def _validate_fill_answer(self, user_answer: str, correct_answer: str) -> Dict[str, Any]:
        """验证填空题答案"""
        # 支持多个正确答案（用分号或逗号分隔）
        correct_answers = [ans.strip() for ans in re.split(r"[;,|]", correct_answer)]

        for correct in correct_answers:
            similarity = SequenceMatcher(None, user_answer.lower(), correct.lower()).ratio()
            if similarity >= 0.8:  # 80%相似度认为正确
                return {"is_correct": 1, "score": 100, "explanation": "答案正确"}

        # 部分匹配检查
        best_similarity = max(
            [
                SequenceMatcher(None, user_answer.lower(), correct.lower()).ratio()
                for correct in correct_answers
            ]
        )

        if best_similarity >= 0.5:
            score = int(best_similarity * 100)
            return {
                "is_correct": 2,  # 部分正确
                "score": score,
                "explanation": f"答案部分正确。正确答案是: {correct_answer}",
            }

        return {
            "is_correct": 0,
            "score": 0,
            "explanation": f"答案错误。正确答案是: {correct_answer}",
        }

    def _validate_judgment_answer(self, user_answer: str, correct_answer: str) -> Dict[str, Any]:
        """验证判断题答案"""
        # 标准化判断答案
        true_keywords = ["对", "正确", "是", "√", "true", "yes", "t", "y", "1"]
        false_keywords = ["错", "错误", "否", "×", "false", "no", "f", "n", "0"]

        user_is_true = any(keyword in user_answer.lower() for keyword in true_keywords)
        user_is_false = any(keyword in user_answer.lower() for keyword in false_keywords)

        correct_is_true = any(keyword in correct_answer.lower() for keyword in true_keywords)
        correct_is_false = any(keyword in correct_answer.lower() for keyword in false_keywords)

        if (user_is_true and correct_is_true) or (user_is_false and correct_is_false):
            return {"is_correct": 1, "score": 100, "explanation": "答案正确"}
        else:
            return {
                "is_correct": 0,
                "score": 0,
                "explanation": f"答案错误。正确答案是: {correct_answer}",
            }

    async def _validate_subjective_answer(
        self, user_answer: str, correct_answer: str, question_content: str
    ) -> Dict[str, Any]:
        """验证主观题答案（使用AI评分）"""
        try:
            prompt = f"""
请评估学生答案的正确性和完整性。

题目：{question_content}

标准答案：{correct_answer}

学生答案：{user_answer}

请按照以下标准评分（总分100分）：
1. 答案正确性（50分）
2. 解题步骤完整性（30分）
3. 表达清晰度（20分）

请以JSON格式返回评分结果：
{{
    "score": 分数(0-100),
    "is_correct": 正确性(0-错误, 1-正确, 2-部分正确),
    "explanation": "详细评价和建议"
}}
"""

            messages = [
                {"role": "system", "content": "你是一个专业的教师，擅长评估学生答案的质量。"},
                {"role": "user", "content": prompt},
            ]

            response = await self.llm_model.chat(messages)

            # 解析AI响应
            try:
                # 提取JSON部分
                start_idx = response.find("{")
                end_idx = response.rfind("}") + 1

                if start_idx != -1 and end_idx != 0:
                    json_str = response[start_idx:end_idx]
                    result = json.loads(json_str)

                    # 验证结果格式
                    if all(key in result for key in ["score", "is_correct", "explanation"]):
                        return result

            except json.JSONDecodeError:
                pass

            # AI评分失败，使用简单相似度匹配
            return self._simple_similarity_score(user_answer, correct_answer)

        except Exception as e:
            logger.error(f"AI评分失败: {str(e)}")
            return self._simple_similarity_score(user_answer, correct_answer)

    def _simple_similarity_score(self, user_answer: str, correct_answer: str) -> Dict[str, Any]:
        """简单相似度评分（AI评分失败时的备选方案）"""
        similarity = SequenceMatcher(None, user_answer.lower(), correct_answer.lower()).ratio()
        score = int(similarity * 100)

        if score >= 80:
            is_correct = 1
            explanation = "答案基本正确"
        elif score >= 50:
            is_correct = 2
            explanation = "答案部分正确，还需完善"
        else:
            is_correct = 0
            explanation = "答案需要改进"

        return {"is_correct": is_correct, "score": score, "explanation": explanation}

    def _validate_general_answer(self, user_answer: str, correct_answer: str) -> Dict[str, Any]:
        """通用答案验证（适用于未明确分类的题型）"""
        return self._simple_similarity_score(user_answer, correct_answer)
