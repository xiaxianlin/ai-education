from app.config import celery_app
import random

@celery_app.task(bind=True, max_retries=2)
def evaluate_speech_task(self, input_data):
    try:
        return {
            "ref": input_data["ref"],
            "hyp": input_data["hyp"],
            "score": {
                "accuracy": random.randint(60, 100),
                "fluency": random.randint(60, 100),
                "completeness": random.randint(60, 100)
            },
            "advice": "注意 th 发音清晰"
        }
    except Exception as e:
        self.retry(countdown=5, exc=e)
