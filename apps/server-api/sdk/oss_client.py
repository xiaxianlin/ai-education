import os
import time
import hashlib
from langchain_openai import ChatOpenAI
import requests
from loguru import logger
from datetime import timedelta
import alibabacloud_oss_v2 as oss
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
    ListChunksRequest,
)
from core.settings import envs


class AliyunRag:

    def __init__(
        self,
        index_id=envs.ALIYUN_RAG_INDEX_ID,
        category_id=envs.ALIYUN_RAG_CATEGORY_ID,
    ):
        config = Config(
            access_key_id=envs.ALIYUN_ACCESS_KEY_ID,
            access_key_secret=envs.ALIYUN_ACCESS_KEY_SECRET,
        )
        config.endpoint = "bailian.cn-beijing.aliyuncs.com"
        self.client = Client(config)
        self.workspace_id = envs.ALIYUN_WORKSPACE_ID
        self.index_id = index_id
        self.category_id = category_id

    def calculate_md5(self, file_path: str) -> str:
        """计算文档的MD5值。"""
        md5_hash = hashlib.md5()

        # 以二进制形式读取文档
        with open(file_path, "rb") as f:
            # 按块读取文档，避免大文档占用过多内存
            for chunk in iter(lambda: f.read(4096), b""):
                md5_hash.update(chunk)

        return md5_hash.hexdigest()

    def get_file_size(self, file_path: str) -> int:
        """获取文档大小（以字节为单位）。"""
        return os.path.getsize(file_path)

    def apply_lease(self, file_name: str, file_path: str):
        """从阿里云百炼服务申请文档上传租约。"""
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
        """将文档上传到阿里云百炼服务。"""
        with open(file_path, "rb") as f:
            file_content = f.read()
        upload_headers = {
            "X-bailian-extra": headers["X-bailian-extra"],
            "Content-Type": headers["Content-Type"],
        }
        response = requests.put(
            pre_signed_url, data=file_content, headers=upload_headers
        )
        response.raise_for_status()

    def add_file(self, lease_id: str):
        """将文档添加到阿里云百炼服务的指定类目中"""
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
        """获取文档的基本信息。"""
        headers = {}
        runtime = RuntimeOptions()
        return self.client.describe_file_with_options(
            self.workspace_id,
            file_id,
            headers,
            runtime,
        )

    def create_index(self, file_id, name):
        """在阿里云百炼服务中创建知识库（初始化）。"""
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
        """向阿里云百炼服务提交索引任务。"""
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
        """向一个非结构化知识库追加导入已解析的文档。"""
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
        """查询索引任务状态。"""
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
        """从指定的非结构化知识库中永久删除一个或多个文档。"""
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
        """在指定的知识库中检索信息。"""
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

    def get_chunks_paginated(
        self, file_id: str = None, page_num: int = 1, page_size: int = 100
    ):
        """
        获取知识库中的所有切片数据

        Args:
            file_id: 文件ID，如果提供则只获取该文件的切片，否则获取所有切片
            page_num: 页码，从1开始
            page_size: 每页大小，最大100

        Returns:
            包含切片数据的响应对象
        """
        request = ListChunksRequest(
            index_id=self.index_id,
            file_id=file_id,
            page_num=page_num,
            page_size=min(page_size, 100),  # 限制最大为100
        )

        res = self.client.list_chunks(self.workspace_id, request)
        return [node.text for node in res.body.data.nodes]

    def get_all_chunks(self, file_id: str = None):
        """
        分页获取所有切片数据（自动处理分页）

        Args:
            file_id: 文件ID，如果提供则只获取该文件的切片，否则获取所有切片

        Returns:
            所有切片的列表
        """
        all_chunks = []
        page_num = 1

        while True:
            try:
                chunks = self.get_chunks_paginated(
                    file_id=file_id, page_num=page_num, page_size=100
                )

                if not chunks or len(chunks) == 0:
                    break

                page_num = page_num + 1
                all_chunks.extend(chunks)
            except Exception as e:
                logger.error(f"获取切片数据失败 (页码 {page_num}): {e}")
                break

        logger.info(f"共获取到 {len(all_chunks)} 个切片")
        return all_chunks

    def exec_upload(self, file_name: str, file_path: str, old_file_id=None) -> str:
        """上传知识库文件，如果已经存在，则更新"""
        try:
            logger.info(f"上传文件：{file_path}")
            logger.info("向阿里云百炼申请上传租约")
            lease_response = self.apply_lease(file_name, file_path)
            lease_id = lease_response.body.data.file_upload_lease_id
            upload_url = lease_response.body.data.param.url
            upload_headers = lease_response.body.data.param.headers

            logger.info("上传文档到阿里云百炼")
            self.upload_file(upload_url, upload_headers, file_path)

            logger.info("将文档添加到阿里云百炼服务器")
            add_response = self.add_file(lease_id)
            file_id = add_response.body.data.file_id

            logger.info("检查阿里云百炼中的文档状态")
            while True:
                describe_response = self.describe_file(file_id)
                status = describe_response.body.data.status
                logger.info(f"当前文档状态：{status}")
                if status == "INIT":
                    logger.info("文档待解析，请稍候...")
                elif status == "PARSING":
                    logger.info("文档解析中，请稍候...")
                elif status == "PARSE_SUCCESS":
                    logger.info("文档解析完成！")
                    break
                else:
                    logger.info(f"未知的文档状态：{status}，请联系技术支持。")
                    break
                time.sleep(1)

            logger.info(f"提交追加文档任务: {file_id}")
            index_add_response = self.submit_index_add_documents_job(file_id)

            job_id = index_add_response.body.data.id

            logger.info(f"获取阿里云百炼索引任务状态: {job_id}")
            while True:
                get_index_job_status_response = self.get_index_job_status(job_id)
                status = get_index_job_status_response.body.data.status
                logger.info(f"当前索引任务状态：{status}")
                if status == "COMPLETED":
                    break
                time.sleep(1)
            if old_file_id:
                logger.info("删除旧文档")
                self.delete_index_document(old_file_id)
            logger.info("阿里云百炼知识库创建成功！")
            return file_id
        except Exception:
            raise ValueError("文档上传知识库异常")


class AliyunOSS:
    def __init__(self):
        credentials_provider = oss.credentials.StaticCredentialsProvider(
            access_key_id=envs.ALIYUN_ACCESS_KEY_ID,
            access_key_secret=envs.ALIYUN_ACCESS_KEY_SECRET,
        )

        cfg = oss.config.load_default()
        cfg.credentials_provider = credentials_provider
        cfg.region = envs.ALIYUN_OSS_REGION
        cfg.endpoint = envs.ALIYUN_OSS_ENDPOINT

        self.bucket = envs.ALIYUN_OSS_BUCKET
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
            upload_parts.append(
                oss.UploadPart(part_number=part_number, etag=up_result.etag)
            )
            offset += part_size
            part_number += 1

        parts = sorted(upload_parts, key=lambda p: p.part_number)
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
