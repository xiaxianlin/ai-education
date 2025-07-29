import uuid
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from schema import TextbookExtractTaskSchema
from store.database.models import Textbook, CourseUnit, TextbookExtractTask
from ai.services import PDFProcessor
from core import get_logger, task_queue
from util import time

logger = get_logger("UnitExtractionService")


class TextbookParserService:
    """单元提取服务"""

    @classmethod
    async def _save_units(cls, db: AsyncSession, textbook_id: int, units: List[Dict[str, Any]]):
        """保存提取的单元到数据库"""
        for unit_data in units:
            # 检查是否已存在相同名称的单元
            existing_unit = await db.scalar(
                select(CourseUnit).where(
                    CourseUnit.textbook_id == textbook_id, CourseUnit.name == unit_data["name"]
                )
            )

            if existing_unit:
                # 更新现有单元
                existing_unit.content = unit_data["content"]
                logger.info(f"Updated existing unit: {unit_data['name']}")
            else:
                # 创建新单元
                new_unit = CourseUnit(
                    textbook_id=textbook_id,
                    name=unit_data["name"],
                    content=unit_data["content"],
                    status=1,
                )
                db.add(new_unit)
                logger.info(f"Created new unit: {unit_data['name']}")

        await db.commit()

    @classmethod
    async def _process_textbook(cls, task_id: int):
        """处理教材PDF的后台任务"""
        from store.database import get_async_session

        async with get_async_session() as db:
            try:
                result = await db.execute(
                    select(TextbookExtractTask)
                    .options(joinedload(TextbookExtractTask.textbook))
                    .where(TextbookExtractTask.id == task_id)
                )
                task = result.scalar_one_or_none()
                if not task:
                    raise ValueError(f"Textbook Task {task.id} not found")

                # 下载PDF文件到临时位置
                logger.info(f"Downloading PDF for textbook {task.textbook_id}")
                if not task.textbook.pdf:
                    raise ValueError(f"Textbook [{task.textbook.id}] pdf not found")

                # 初始化PDF处理器
                processor = PDFProcessor()

                # 提取单元信息
                logger.info(f"Extracting units from PDF for textbook {task.textbook_id}")
                units = await processor.extract_units_from_pdf(task.textbook.pdf)

                # 保存单元到数据库
                logger.info(f"Saving {len(units)} units for textbook {task.textbook_id}")
                await cls._save_units(db, task.textbook_id, units)

                # 更新处理状态为完成
                task.status = "completed"
                task.error = None
                await db.commit()

                logger.info(f"Successfully processed textbook {task.textbook_id}")

            except Exception as e:
                logger.error(f"Error processing textbook {task.textbook_id}: {str(e)}")

                # 更新处理状态为失败
                try:
                    task = await db.scalar(
                        select(TextbookExtractTask).where(TextbookExtractTask.id == task_id)
                    )
                    if task:
                        task.status = "failed"
                        task.error = str(e)
                        task.complete_time = time.now()
                        await db.commit()
                except Exception as commit_error:
                    logger.error(f"Failed to update textbook status: {str(commit_error)}")

                raise

    @classmethod
    async def start_extraction(cls, db: AsyncSession, textbook_id: int):
        """启动PDF单元提取任务"""
        textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
        if not textbook:
            raise ValueError("教材不存在")

        if not textbook.pdf:
            raise ValueError("教材PDF文件不存在")

        if textbook.processing_status == "processing":
            raise ValueError("正在处理中，请勿重复提交")

        task = TextbookExtractTask(
            id=str(uuid.uuid4()),
            status="processing",
            textbook_id=textbook_id,
        )
        db.add(task)
        await db.commit()

        # 添加后台任务
        await task_queue.add_task(
            task_id=task.id,
            name=f"extract_units_textbook_{textbook_id}",
            func=cls._process_textbook,
        )

        logger.info(f"Started unit extraction task {task.id} for textbook {textbook_id}")
        return task.id

    @staticmethod
    async def get_task(db: AsyncSession, task_id: int) -> Dict[str, Any]:
        """获取处理状态"""
        task = await db.scalar(select(TextbookExtractTask).where(TextbookExtractTask.id == task_id))
        if not task:
            raise ValueError("教材解析任务不存在")

        return TextbookExtractTaskSchema.model_validate(task)
