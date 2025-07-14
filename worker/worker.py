from app.config import celery_app
import app.tasks.question_generation
import app.tasks.speech_evaluation

if __name__ == "__main__":
    celery_app.worker_main()
