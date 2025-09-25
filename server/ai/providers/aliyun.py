import json
from http import HTTPStatus
from dashscope import Application

from core import settings
from core.logger import get_logger


class AliyunAgent:
    logger = get_logger("AliyunAgent")

    @classmethod
    def call(cls, query: str, app_id: str, file_id: str) -> dict:
        response = Application.call(
            api_key=settings.ALIYUN_AI_KEY,
            app_id=app_id,
            prompt=query,
            rag_options={"file_ids": [file_id]},
        )
        if response.status_code != HTTPStatus.OK:
            raise ValueError(response.message)

        raw_text = response.output.text
        if not raw_text:
            raise ValueError("提取数据失败")

        try:
            json_data = json.loads(raw_text)
            return json_data
        except json.JSONDecodeError:
            raise ValueError("提取的 JSON 格式错误")


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


import os
import hashlib
import requests
from alibabacloud_tea_util.models import RuntimeOptions
from alibabacloud_tea_openapi.models import Config
from alibabacloud_bailian20231229.client import Client
from alibabacloud_bailian20231229.models import (
    AddFileRequest,
    RetrieveRequest,
    CreateIndexRequest,
    SubmitIndexJobRequest,
    GetIndexJobStatusRequest,
    DeleteIndexDocumentRequest,
    ApplyFileUploadLeaseRequest,
    SubmitIndexAddDocumentsJobRequest,
)

from core import settings
from core.logger import get_logger


class AliyunRag:
    logger = get_logger("AliyunRag")

    def __init__(
        self,
        index_id=settings.ALIYUN_RAG_INDEX_ID,
        category_id=settings.ALIYUN_RAG_CATEGORY_ID,
    ):
        config = Config(
            access_key_id=settings.ALIYUN_ACCESS_KEY_ID,
            access_key_secret=settings.ALIYUN_ACCESS_KEY_SECRET,
        )
        config.endpoint = "bailian.cn-beijing.aliyuncs.com"
        self.client = Client(config)
        self.workspace_id = settings.ALIYUN_WORKSPACE_ID
        self.index_id = index_id
        self.category_id = category_id

        self.logger.info(
            f"""\
\nworkspace_id: {self.workspace_id} \
\nindex_id: {self.index_id} \
\ncategory_id: {self.category_id}
"""
        )

    def calculate_md5(self, file_path: str) -> str:
        """
        计算文档的MD5值。

        参数:
            file_path (str): 文档本地路径。

        返回:
            str: 文档的MD5值。
        """
        md5_hash = hashlib.md5()

        # 以二进制形式读取文档
        with open(file_path, "rb") as f:
            # 按块读取文档，避免大文档占用过多内存
            for chunk in iter(lambda: f.read(4096), b""):
                md5_hash.update(chunk)

        return md5_hash.hexdigest()

    def get_file_size(self, file_path: str) -> int:
        """
        获取文档大小（以字节为单位）。
        参数:
            file_path (str): 文档本地路径。
        返回:
            int: 文档大小（以字节为单位）。
        """
        return os.path.getsize(file_path)

    def apply_lease(self, file_name: str, file_path: str):
        """
        从阿里云百炼服务申请文档上传租约。

        参数:
            file_name (str): 文档名称。
            file_path (str): 文档本地路径。

        返回:
            阿里云百炼服务的响应。
        """
        headers = {}
        request = ApplyFileUploadLeaseRequest(
            file_name=file_name,
            md_5=self.calculate_md5(file_path),
            size_in_bytes=self.get_file_size(file_path),
        )
        runtime = RuntimeOptions()
        return self.client.apply_file_upload_lease_with_options(
            self.category_id,
            self.workspace_id,
            request,
            headers,
            runtime,
        )

    def upload_file(self, pre_signed_url: str, headers: dict, file_path: str):
        """
        将文档上传到阿里云百炼服务。
        参数:
            pre_signed_url (str): 上传租约中的 URL。
            headers (dict): 上传请求的头部。
            file_path (str): 文档本地路径。
        """
        with open(file_path, "rb") as f:
            file_content = f.read()
        upload_headers = {
            "X-bailian-extra": headers["X-bailian-extra"],
            "Content-Type": headers["Content-Type"],
        }
        response = requests.put(pre_signed_url, data=file_content, headers=upload_headers)
        response.raise_for_status()

    def add_file(self, lease_id: str):
        """
        将文档添加到阿里云百炼服务的指定类目中。

        参数:
            lease_id (str): 租约ID。

        返回:
            阿里云百炼服务的响应。
        """
        headers = {}
        request = AddFileRequest(
            lease_id=lease_id,
            parser="DASHSCOPE_DOCMIND",
            category_id=self.category_id,
        )
        runtime = RuntimeOptions()
        return self.client.add_file_with_options(
            self.workspace_id,
            request,
            headers,
            runtime,
        )

    def describe_file(self, file_id: str):
        """
        获取文档的基本信息。

        参数:
            file_id (str): 文档ID。

        返回:
            阿里云百炼服务的响应。
        """
        headers = {}
        runtime = RuntimeOptions()
        return self.client.describe_file_with_options(
            self.workspace_id,
            file_id,
            headers,
            runtime,
        )

    def create_index(self, file_id, name):
        """
        在阿里云百炼服务中创建知识库（初始化）。

        参数:
            file_id (str): 文档ID。
            name (str): 知识库名称。

        返回:
            阿里云百炼服务的响应。
        """
        headers = {}
        request = CreateIndexRequest(
            name=name,
            structure_type="unstructured",
            source_type="DATA_CENTER_FILE",
            sink_type="BUILT_IN",
            document_ids=[file_id],
        )
        runtime = RuntimeOptions()
        return self.client.create_index_with_options(
            self.workspace_id,
            request,
            headers,
            runtime,
        )

    def submit_index(self):
        """
        向阿里云百炼服务提交索引任务。

        返回:
            阿里云百炼服务的响应。
        """
        headers = {}
        submit_index_job_request = SubmitIndexJobRequest(index_id=self.index_id)
        runtime = RuntimeOptions()
        return self.client.submit_index_job_with_options(
            self.workspace_id,
            submit_index_job_request,
            headers,
            runtime,
        )

    def submit_index_add_documents_job(self, file_id):
        """
        向一个非结构化知识库追加导入已解析的文档。

        参数:
            file_id (str): 文档ID。

        返回:
            阿里云百炼服务的响应。
        """
        headers = {}
        submit_index_add_documents_job_request = SubmitIndexAddDocumentsJobRequest(
            index_id=self.index_id,
            document_ids=[file_id],
            source_type="DATA_CENTER_FILE",
        )
        runtime = RuntimeOptions()
        return self.client.submit_index_add_documents_job_with_options(
            self.workspace_id,
            submit_index_add_documents_job_request,
            headers,
            runtime,
        )

    def get_index_job_status(self, job_id: str):
        """
        查询索引任务状态。

        参数:
            job_id (str): 任务ID。

        返回:
            阿里云百炼服务的响应。
        """
        headers = {}
        get_index_job_status_request = GetIndexJobStatusRequest(
            index_id=self.index_id,
            job_id=job_id,
        )
        runtime = RuntimeOptions()
        return self.client.get_index_job_status_with_options(
            self.workspace_id, get_index_job_status_request, headers, runtime
        )

    def delete_index_document(self, file_id):
        """
        从指定的非结构化知识库中永久删除一个或多个文档。

        参数:
            file_id (str): 文档ID。

        返回:
            阿里云百炼服务的响应。
        """
        headers = {}
        delete_index_document_request = DeleteIndexDocumentRequest(
            index_id=self.index_id, document_ids=[file_id]
        )
        runtime = RuntimeOptions()
        return self.client.delete_index_document_with_options(
            self.workspace_id,
            delete_index_document_request,
            headers,
            runtime,
        )

    def retrieve(self, query):
        """
        在指定的知识库中检索信息。

        参数:
            query (str): 检索query。

        返回:
            阿里云百炼服务的响应。
        """
        headers = {}
        retrieve_request = RetrieveRequest(
            index_id=self.index_id,
            query=query,
        )
        runtime = RuntimeOptions()
        return self.client.retrieve_with_options(
            self.workspace_id,
            retrieve_request,
            headers,
            runtime,
        )
