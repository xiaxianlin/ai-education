from app.config import celery_app
import time
import random

@celery_app.task(bind=True, max_retries=3)
def generate_questions_task(self, input_data):
    try:
        # 模拟 LLM 生成
        time.sleep(2)
        result = {
            "questions": [
                {
                    "type": "选择题",
                    "question": f"{input_data['textbook_section']}相关题目",
                    "options": ["A", "B", "C", "D"],
                    "answer": "A",
                    "explanation": "解析内容"
                }
            ]
        }
        return {"status": "success", "result": result}
    except Exception as e:
        self.retry(countdown=10, exc=e)
