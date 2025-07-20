import uuid
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from store.database.models import Textbook, CourseUnit
from ai.models.pdf_processor import PDFProcessor
from core import get_logger
from core.task_queue import task_queue
from service.common import FileService


logger = get_logger("UnitExtractionService")


class UnitExtractionService:
    """单元提取服务"""
    
    @staticmethod
    async def start_extraction(db: AsyncSession, textbook_id: int):
        """启动PDF单元提取任务"""
        textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
        if not textbook:
            raise ValueError("教材不存在")
        
        if not textbook.pdf:
            raise ValueError("教材PDF文件不存在")
        
        if textbook.processing_status == "processing":
            raise ValueError("正在处理中，请勿重复提交")
        
        # 生成任务ID
        task_id = str(uuid.uuid4())
        
        # 更新处理状态
        textbook.processing_status = "processing"
        textbook.processing_task_id = task_id
        textbook.processing_error = None
        await db.commit()
        
        # 添加后台任务
        await task_queue.add_task(
            task_id=task_id,
            name=f"extract_units_textbook_{textbook_id}",
            func=UnitExtractionService._process_textbook,
            textbook_id=textbook_id
        )
        
        logger.info(f"Started unit extraction task {task_id} for textbook {textbook_id}")
        return task_id
    
    @staticmethod
    async def _process_textbook(textbook_id: int):
        """处理教材PDF的后台任务"""
        from store.database import get_async_session
        
        async with get_async_session() as db:
            try:
                textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
                if not textbook:
                    raise ValueError(f"Textbook {textbook_id} not found")
                
                # 下载PDF文件到临时位置
                logger.info(f"Downloading PDF for textbook {textbook_id}")
                local_pdf_path = await FileService.download_temp(textbook.pdf)
                
                try:
                    # 初始化PDF处理器
                    processor = PDFProcessor()
                    
                    # 提取单元信息
                    logger.info(f"Extracting units from PDF for textbook {textbook_id}")
                    units = await processor.extract_units_from_pdf(local_pdf_path)
                    
                    # 保存单元到数据库
                    logger.info(f"Saving {len(units)} units for textbook {textbook_id}")
                    await UnitExtractionService._save_units(db, textbook_id, units)
                    
                    # 更新处理状态为完成
                    textbook.processing_status = "completed"
                    textbook.processing_error = None
                    await db.commit()
                    
                    logger.info(f"Successfully processed textbook {textbook_id}")
                    
                finally:
                    # 清理临时文件
                    import os
                    if os.path.exists(local_pdf_path):
                        os.remove(local_pdf_path)
                
            except Exception as e:
                logger.error(f"Error processing textbook {textbook_id}: {str(e)}")
                
                # 更新处理状态为失败
                try:
                    textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
                    if textbook:
                        textbook.processing_status = "failed"
                        textbook.processing_error = str(e)
                        await db.commit()
                except Exception as commit_error:
                    logger.error(f"Failed to update textbook status: {str(commit_error)}")
                
                raise
    
    @staticmethod
    async def _save_units(db: AsyncSession, textbook_id: int, units: List[Dict[str, Any]]):
        """保存提取的单元到数据库"""
        for unit_data in units:
            # 检查是否已存在相同名称的单元
            existing_unit = await db.scalar(
                select(CourseUnit).where(
                    CourseUnit.textbook_id == textbook_id,
                    CourseUnit.name == unit_data['name']
                )
            )
            
            if existing_unit:
                # 更新现有单元
                existing_unit.content = unit_data['content']
                logger.info(f"Updated existing unit: {unit_data['name']}")
            else:
                # 创建新单元
                new_unit = CourseUnit(
                    textbook_id=textbook_id,
                    name=unit_data['name'],
                    content=unit_data['content'],
                    status=1
                )
                db.add(new_unit)
                logger.info(f"Created new unit: {unit_data['name']}")
        
        await db.commit()
    
    @staticmethod
    async def get_processing_status(db: AsyncSession, textbook_id: int) -> Dict[str, Any]:
        """获取处理状态"""
        textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
        if not textbook:
            raise ValueError("教材不存在")
        
        result = {
            "status": textbook.processing_status,
            "task_id": textbook.processing_task_id,
            "error": textbook.processing_error
        }
        
        # 如果有任务ID，获取详细任务状态
        if textbook.processing_task_id:
            task_status = task_queue.get_task_status(textbook.processing_task_id)
            if task_status:
                result["task_details"] = task_status
        
        return result