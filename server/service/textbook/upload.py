import os
import asyncio
from pathlib import Path
from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from aliyun.oss import AliyunOSS
from core import settings
from store.database.models import Textbook
from util import time, rag


class TextbookUploadService:
    async def run(db: AsyncSession, id: int, file: UploadFile):

        textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
        if not textbook:
            raise ValueError("教材不存在")
        textbook.file = file.filename

        # 上传到 oss
        oss = AliyunOSS()
        data = await file.read()

        # 提前创建任务（协程对象）
        task = asyncio.create_task(oss.multipart_upload(f"textbook/{file.filename}", data))

        try:
            tmp_dir = f"{settings.RUNTIME_DIR}/tmp"
            os.makedirs(tmp_dir, exist_ok=True)
            tmp_file_path = Path(tmp_dir) / file.filename

            with open(tmp_file_path, "wb") as buffer:
                buffer.write(data)

            # 更新索引（同步）
            textbook.index_file_id = rag.update(
                file.filename,
                tmp_file_path,
                textbook.index_file_id,
            )

            # 等待 OSS 上传完成
            await task

            textbook.update_time = time.now()
            await db.commit()
        except ValueError as e:
            os.remove(tmp_file_path)
            raise e
