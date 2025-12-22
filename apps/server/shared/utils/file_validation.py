"""文件上传安全验证工具"""

import uuid
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException
from loguru import logger

# 允许的文件类型
ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {"application/pdf"}

# 最大文件大小（100MB）
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# PDF 文件头魔数
PDF_MAGIC_BYTES = b"%PDF"


def validate_file_upload(file: UploadFile) -> Tuple[bytes, str]:
    """
    验证并读取上传的文件
    
    Args:
        file: FastAPI UploadFile 对象
        
    Returns:
        Tuple[文件内容(bytes), 安全文件名(str)]
        
    Raises:
        HTTPException: 如果文件验证失败
    """
    # 1. 验证文件扩展名
    file_ext = Path(file.filename).suffix.lower() if file.filename else ""
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型。仅支持: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 2. 验证 MIME 类型
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件 MIME 类型。仅支持: {', '.join(ALLOWED_MIME_TYPES)}"
        )
    
    # 3. 读取文件内容
    data = file.file.read()
    
    # 4. 验证文件大小
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小超过限制。最大允许: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="文件为空")
    
    # 5. 验证文件内容（PDF 文件头）
    if file_ext == ".pdf":
        if not data.startswith(PDF_MAGIC_BYTES):
            raise HTTPException(status_code=400, detail="文件内容验证失败：不是有效的 PDF 文件")
    
    # 6. 生成安全文件名（UUID + 原始扩展名）
    safe_filename = f"{uuid.uuid4().hex}{file_ext}"
    
    logger.info(
        f"文件验证通过: 原始文件名={file.filename}, "
        f"安全文件名={safe_filename}, "
        f"大小={len(data)} bytes, "
        f"MIME类型={file.content_type}"
    )
    
    return data, safe_filename

