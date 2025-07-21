from fastapi import UploadFile

from core.logger import get_logger
from store.oss import OSSFactory, OSS

logger = get_logger("FileService")


class FileService:

    async def upload(filepath: str, file: UploadFile):
        oss: OSS = OSSFactory.get_service()
        data = await file.read()
        return oss.upload(filepath, data)

    async def multipart_upload(filepath: str, file: UploadFile):
        oss: OSS = OSSFactory.get_service()
        data = await file.read()
        return oss.multipart_upload(filepath, data)

    async def delete(filepath: str):
        if "::" not in filepath:
            raise ValueError("文件路径不合法")
        platform, filepath = filepath.split("::")
        logger.info(f"platform: {platform}, filepath: {filepath}")
        oss: OSS = OSSFactory.get_service(platform)
        return oss.delete(filepath)

    async def download(filepath: str):
        pass
