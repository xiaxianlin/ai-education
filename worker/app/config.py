from celery import Celery

def make_celery():
    celery = Celery(
        "k12_tasks",
        broker="redis://localhost:6379/0",
        backend="redis://localhost:6379/0"
    )
    celery.conf.update(task_serializer='json', result_serializer='json', accept_content=['json'])
    return celery

celery_app = make_celery()
