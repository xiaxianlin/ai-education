"""OSS 服务"""

from alibabacloud_oss_v2.client import Client
from core.settings import envs
from loguru import logger


client = Client(
    endpoint=envs.ALIYUN_OSS_ENDPOINT,
    access_key_id=envs.ALIYUN_ACCESS_KEY_ID,
    access_key_secret=envs.ALIYUN_ACCESS_KEY_SECRET,
)


def upload(oss_path: str, file_data: bytes) -> str:
    """上传文件到 OSS"""
    try:
        client.put_object(bucket=envs.ALIYUN_OSS_BUCKET, key=oss_path, body=file_data)
        logger.info(f"文件上传成功: {oss_path}")
        return oss_path
    except Exception as e:
        logger.error(f"文件上传失败: {oss_path}, error={e}")
        raise


def exist(oss_path: str) -> bool:
    """检查文件是否存在"""
    try:
        client.head_object(bucket=envs.ALIYUN_OSS_BUCKET, key=oss_path)
        return True
    except Exception:
        return False


def delete(oss_path: str):
    """删除文件"""
    try:
        client.delete_object(bucket=envs.ALIYUN_OSS_BUCKET, key=oss_path)
        logger.info(f"文件删除成功: {oss_path}")
    except Exception as e:
        logger.error(f"文件删除失败: {oss_path}, error={e}")
        raise
