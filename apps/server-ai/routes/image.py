"""图片生成路由"""
import os
import requests
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger

from schemas.image import ImageGenerateRequest, ImageGenerateResponse
from core.database import Database, Question
from services.image_service import ImageService
from services.oss_service import OSSService
from utils.question import build_full_question_text
from core.settings import envs

router = APIRouter(prefix="/api/v1/image", tags=["Image"])


@router.post("/generate", response_model=ImageGenerateResponse)
async def generate_image(request: ImageGenerateRequest):
    """生成图片"""
    try:
        image_url = ImageService.generate_image(
            text=request.text,
            width=request.width,
            height=request.height,
            optimize_prompt=request.optimize_prompt,
        )
        
        return ImageGenerateResponse(image_url=image_url)
    except Exception as e:
        logger.error(f"图片生成失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/question/{question_id}")
async def generate_question_image(
    question_id: int,
    db: AsyncSession = Database,
):
    """为指定题目生成图片并更新数据库"""
    try:
        # 获取题目
        question = await db.scalar(
            select(Question).where(Question.id == question_id)
        )
        if not question:
            raise ValueError(f"题目不存在: {question_id}")

        # 构建完整的问题内容
        full_question_text = build_full_question_text(question)

        # 生成图片
        image_url = ImageService.generate_image(
            text=full_question_text,
            width=1328,
            height=1328,
            optimize_prompt=True,
        )

        # 下载图片
        tmp_dir = Path(envs.TMP_DIR)
        tmp_dir.mkdir(parents=True, exist_ok=True)
        image_path = tmp_dir / f"question_{question_id}_image.jpg"
        
        response = requests.get(image_url, stream=True)
        response.raise_for_status()
        with open(image_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # 读取文件内容
        with open(image_path, "rb") as f:
            file_data = f.read()

        # 上传到 OSS
        oss_path = f"questions/{question.textbook_id}/images/{question_id}.jpg"
        oss = OSSService()
        
        # 检查文件是否存在，如果存在则先删除
        if oss.exist(oss_path):
            logger.info(f"OSS 文件已存在，先删除: {oss_path}")
            oss.delete(oss_path)

        oss.upload(oss_path, file_data)

        # 更新题目资源字段
        question.resource = oss_path
        question.resource_type = "image"
        await db.commit()
        await db.refresh(question)

        # 清理临时文件
        os.remove(image_path)

        logger.info(f"题目 {question_id} 图片生成并更新成功")
        return {"message": "图片生成成功", "resource": oss_path}
    except Exception as e:
        logger.error(f"题目图片生成失败: question_id={question_id}, error={e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

