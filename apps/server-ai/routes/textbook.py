"""教材解析路由"""

from typing import List
from fastapi import APIRouter

from core.schema import UnitInfo, TextbookUploadRequest
from services import textbook

router = APIRouter(tags=["Textbook"])


@router.post("/{file_index_id}/parse", response_model=List[UnitInfo])
async def parse_textbook(file_index_id: str):
    """教材解析"""
    return await textbook.parse_textbook(file_index_id)


@router.post("/upload")
async def upload_textbook(params: TextbookUploadRequest):
    """上传教材文件到RAG知识库"""
    return await textbook.upload_textbook(params)
