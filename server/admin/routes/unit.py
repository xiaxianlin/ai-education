from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateUnitSchema, UpdateUnitSchema
from admin.services import unit
from admin.services.knowledge import query_knowledge_by_unit
from admin.services.question import query_question_by_unit
from admin.services.unit import query_unit_by_textbook
from shared.services.task import TaskService
from shared.ai.services.question import generate_question_by_unit
from core.database import Database
from core.schema import SearchSchema

unit_router = APIRouter(prefix="/unit")


@unit_router.post("/")
async def create_unit(params: CreateUnitSchema, db: AsyncSession = Database):
    return await unit.create_unit(db, params)


@unit_router.post("/{id}/generate/{count}")
async def generate_question(
    id: int,
    count: int,
    async_exec: bool = Query(True, description="是否后台异步执行，默认true"),
    db: AsyncSession = Database,
):
    """生成题目接口
    
    Args:
        id: 单元ID
        count: 生成题目数量
        async_exec: 是否后台异步执行，默认true。如果为false，则同步执行并返回生成的题目列表
    """
    if async_exec:
        # 后台异步执行
        task = await TaskService.create_task(
            db=db,
            task_type="generate_question",
            task_name=f"为单元 {id} 生成 {count} 道题目",
            params={
                "unit_id": id,
                "count": count,
            },
            handler_module="admin.services.task_handlers",
            handler_function="generate_question_handler",
        )
        return {
            "task_id": task.id,
            "status": task.status,
            "message": "任务已提交，正在后台执行",
        }
    else:
        # 同步执行
        questions = await generate_question_by_unit(db, id, count)
        return {
            "questions": [
                {
                    "id": q.id,
                    "type": q.type,
                    "subtype": q.subtype,
                    "content": q.content,
                    "answer": q.answer,
                    "difficulty": q.difficulty,
                }
                for q in questions
            ],
            "count": len(questions),
            "message": "题目生成完成",
        }


@unit_router.patch("/{id}")
async def update_unit(id: int, unit_update: UpdateUnitSchema, db: AsyncSession = Database):
    await unit.update_unit(db, id, unit_update)


@unit_router.delete("/{id}")
async def delete_unit(id: int, db: AsyncSession = Database):
    await unit.delete_unit(db=db, id=id)


@unit_router.get("/search")
async def search_unit(params: SearchSchema = Depends(), db: AsyncSession = Database):
    return await unit.search_unit(db, params)


@unit_router.get("/textbook/{id}")
async def query_unit_by_textbook_id(id: int, db: AsyncSession = Database):
    return await query_unit_by_textbook(db, id)


@unit_router.get("/{id}/knowledges")
async def query_knowledges(id: int, db: AsyncSession = Database):
    return await query_knowledge_by_unit(db, id)


@unit_router.get("/{id}/questions")
async def query_question(id: int, page: int = 1, size: int = 10, db: AsyncSession = Database):
    return await query_question_by_unit(db, id, page, size)
