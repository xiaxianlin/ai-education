import alibabacloud_oss_v2 as oss
from datetime import timedelta
from core import settings


class AliyunOSS:
    def __init__(self):
        credentials_provider = oss.credentials.StaticCredentialsProvider(
            access_key_id=settings.ALIYUN_ACCESS_KEY_ID,
            access_key_secret=settings.ALIYUN_ACCESS_KEY_SECRET,
        )

        cfg = oss.config.load_default()
        cfg.credentials_provider = credentials_provider
        cfg.region = settings.ALIYUN_OSS_REGION
        cfg.endpoint = settings.ALIYUN_OSS_ENDPOINT

        self.bucket = settings.ALIYUN_OSS_BUCKET
        self.client = oss.Client(cfg)

    def exist(self, filepath: str):
        return self.client.is_object_exist(bucket=self.bucket, key=filepath)

    def upload(self, filepath: str, data: bytes) -> str:
        req = oss.PutObjectRequest(bucket=self.bucket, key=filepath, body=data)
        self.client.put_object(req)

    async def multipart_upload(self, filepath: str, data: bytes) -> str:
        # 初始化分片上传请求，获取upload_id用于后续分片上传
        result = self.client.initiate_multipart_upload(
            oss.InitiateMultipartUploadRequest(bucket=self.bucket, key=filepath)
        )

        part_size = 5 * 1024 * 1024
        upload_parts = []
        part_number = 1
        offset = 0
        while offset < len(data):
            chunk = data[offset : offset + part_size]
            up_result = self.client.upload_part(
                oss.UploadPartRequest(
                    bucket=self.bucket,
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
        print(parts)
        # 发送完成分片上传请求，合并所有分片为一个完整的对象
        self.client.complete_multipart_upload(
            oss.CompleteMultipartUploadRequest(
                bucket=self.bucket,
                key=filepath,
                upload_id=result.upload_id,
                complete_multipart_upload=oss.CompleteMultipartUpload(parts=parts),
            )
        )

    def delete(self, filepath: str):
        if not self.exist(filepath):
            return
        req = oss.DeleteObjectRequest(bucket=self.bucket, key=filepath)
        self.client.delete_object(req)

    def get_file(self, filepath: str):
        req = oss.GetObjectRequest(bucket=self.bucket, key=filepath)
        res = self.client.get_object(req)
        return res.body.read()

    def get_access_url(self, filepath: str, days: int = 7):
        req = oss.GetObjectRequest(bucket=self.bucket, key=filepath)
        res = self.client.presign(req, expires=timedelta(days=days))
        return res.url
