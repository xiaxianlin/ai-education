"""OSS 服务"""

import alibabacloud_oss_v2 as oss
from loguru import logger
from datetime import timedelta

from core.settings import envs

credentials_provider = oss.credentials.StaticCredentialsProvider(
    access_key_id=envs.ALIYUN_ACCESS_KEY_ID,
    access_key_secret=envs.ALIYUN_ACCESS_KEY_SECRET,
)

cfg = oss.config.load_default()
cfg.credentials_provider = credentials_provider
cfg.region = envs.ALIYUN_OSS_REGION
cfg.endpoint = envs.ALIYUN_OSS_ENDPOINT


client = oss.Client(cfg)


def exist(filepath: str):
    return client.is_object_exist(bucket=envs.ALIYUN_OSS_BUCKET, key=filepath)


def upload(filepath: str, data: bytes) -> str:
    if exist(filepath):
        logger.info(f"OSS 文件已存在，先删除: {filepath}")
        delete(filepath)

    req = oss.PutObjectRequest(bucket=envs.ALIYUN_OSS_BUCKET, key=filepath, body=data)
    client.put_object(req)


async def multipart_upload(filepath: str, data: bytes) -> str:
    # 初始化分片上传请求，获取upload_id用于后续分片上传
    result = client.initiate_multipart_upload(
        oss.InitiateMultipartUploadRequest(bucket=envs.ALIYUN_OSS_BUCKET, key=filepath)
    )

    part_size = 5 * 1024 * 1024
    upload_parts = []
    part_number = 1
    offset = 0
    while offset < len(data):
        chunk = data[offset : offset + part_size]
        up_result = client.upload_part(
            oss.UploadPartRequest(
                bucket=envs.ALIYUN_OSS_BUCKET,
                key=filepath,
                upload_id=result.upload_id,
                part_number=part_number,
                body=chunk,
            )
        )
        upload_parts.append(oss.UploadPart(part_number=part_number, etag=up_result.etag))
        offset += part_size
        part_number += 1

    parts = sorted(upload_parts, key=lambda p: p.part_number)
    # 发送完成分片上传请求，合并所有分片为一个完整的对象
    client.complete_multipart_upload(
        oss.CompleteMultipartUploadRequest(
            bucket=envs.ALIYUN_OSS_BUCKET,
            key=filepath,
            upload_id=result.upload_id,
            complete_multipart_upload=oss.CompleteMultipartUpload(parts=parts),
        )
    )


def delete(filepath: str):
    if not exist(filepath):
        return
    req = oss.DeleteObjectRequest(bucket=envs.ALIYUN_OSS_BUCKET, key=filepath)
    client.delete_object(req)


def get_file(filepath: str):
    req = oss.GetObjectRequest(bucket=envs.ALIYUN_OSS_BUCKET, key=filepath)
    res = client.get_object(req)
    return res.body.read()


def get_access_url(filepath: str, days: int = 7):
    req = oss.GetObjectRequest(bucket=envs.ALIYUN_OSS_BUCKET, key=filepath)
    res = client.presign(req, expires=timedelta(days=days))
    return res.url
