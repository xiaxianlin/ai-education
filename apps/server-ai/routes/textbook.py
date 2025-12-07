"""教材解析路由"""

from typing import List
from fastapi import APIRouter
from schemas.textbook import UnitInfo
from services import textbook, rag

router = APIRouter(prefix="/textbook", tags=["Textbook"])


@router.post("/parse/{file_index_id}", response_model=List[UnitInfo])
async def parse_textbook(file_index_id: str):
    """教材解析"""
    return await textbook.parse_by_rag(file_index_id)


@router.post("/upload_rag/")
async def upload_rag_file(file_name: str, file_path: str, old_file_id=None):
    """上传教材文件到RAG知识库"""
    return await rag.upload(file_name, file_path, old_file_id)
