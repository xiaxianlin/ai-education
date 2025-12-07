import os
import time
import hashlib
import requests
from loguru import logger
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


config = Config(
    access_key_id=envs.ALIYUN_ACCESS_KEY_ID,
    access_key_secret=envs.ALIYUN_ACCESS_KEY_SECRET,
)

config.endpoint = "bailian.cn-beijing.aliyuncs.com"
client = Client(config)
workspace_id = envs.ALIYUN_WORKSPACE_ID
index_id = envs.ALIYUN_RAG_INDEX_ID
category_id = envs.ALIYUN_RAG_CATEGORY_ID


def calculate_md5(file_path: str) -> str:
    """计算文档的MD5值。"""
    md5_hash = hashlib.md5()

    # 以二进制形式读取文档
    with open(file_path, "rb") as f:
        # 按块读取文档，避免大文档占用过多内存
        for chunk in iter(lambda: f.read(4096), b""):
            md5_hash.update(chunk)

    return md5_hash.hexdigest()


def get_file_size(file_path: str) -> int:
    """获取文档大小（以字节为单位）。"""
    return os.path.getsize(file_path)


def apply_lease(file_name: str, file_path: str):
    """从阿里云百炼服务申请文档上传租约。"""
    headers = {}
    request = ApplyFileUploadLeaseRequest(
        file_name=file_name,
        md_5=calculate_md5(file_path),
        size_in_bytes=get_file_size(file_path),
    )
    runtime = RuntimeOptions()
    return client.apply_file_upload_lease_with_options(
        category_id,
        workspace_id,
        request,
        headers,
        runtime,
    )


def upload_file(pre_signed_url: str, headers: dict, file_path: str):
    """将文档上传到阿里云百炼服务。"""
    with open(file_path, "rb") as f:
        file_content = f.read()
    upload_headers = {
        "X-bailian-extra": headers["X-bailian-extra"],
        "Content-Type": headers["Content-Type"],
    }
    response = requests.put(pre_signed_url, data=file_content, headers=upload_headers)
    response.raise_for_status()


def add_file(lease_id: str):
    """将文档添加到阿里云百炼服务的指定类目中"""
    headers = {}
    request = AddFileRequest(
        lease_id=lease_id,
        parser="DASHSCOPE_DOCMIND",
        category_id=category_id,
    )
    runtime = RuntimeOptions()
    return client.add_file_with_options(
        workspace_id,
        request,
        headers,
        runtime,
    )


def describe_file(file_id: str):
    """获取文档的基本信息。"""
    headers = {}
    runtime = RuntimeOptions()
    return client.describe_file_with_options(
        workspace_id,
        file_id,
        headers,
        runtime,
    )


def create_index(file_id, name):
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
    return client.create_index_with_options(
        workspace_id,
        request,
        headers,
        runtime,
    )


def submit_index(self):
    """向阿里云百炼服务提交索引任务。"""
    headers = {}
    submit_index_job_request = SubmitIndexJobRequest(index_id=index_id)
    runtime = RuntimeOptions()
    return client.submit_index_job_with_options(
        workspace_id,
        submit_index_job_request,
        headers,
        runtime,
    )


def submit_index_add_documents_job(file_id):
    """向一个非结构化知识库追加导入已解析的文档。"""
    headers = {}
    submit_index_add_documents_job_request = SubmitIndexAddDocumentsJobRequest(
        index_id=index_id,
        document_ids=[file_id],
        source_type="DATA_CENTER_FILE",
    )
    runtime = RuntimeOptions()
    return client.submit_index_add_documents_job_with_options(
        workspace_id,
        submit_index_add_documents_job_request,
        headers,
        runtime,
    )


def get_index_job_status(job_id: str):
    """查询索引任务状态。"""
    headers = {}
    get_index_job_status_request = GetIndexJobStatusRequest(
        index_id=index_id,
        job_id=job_id,
    )
    runtime = RuntimeOptions()
    return client.get_index_job_status_with_options(
        workspace_id, get_index_job_status_request, headers, runtime
    )


def delete_index_document(file_id):
    """从指定的非结构化知识库中永久删除一个或多个文档。"""
    headers = {}
    delete_index_document_request = DeleteIndexDocumentRequest(
        index_id=index_id, document_ids=[file_id]
    )
    runtime = RuntimeOptions()
    return client.delete_index_document_with_options(
        workspace_id,
        delete_index_document_request,
        headers,
        runtime,
    )


def retrieve(query):
    """在指定的知识库中检索信息。"""
    headers = {}
    retrieve_request = RetrieveRequest(
        index_id=index_id,
        query=query,
    )
    runtime = RuntimeOptions()
    return client.retrieve_with_options(
        workspace_id,
        retrieve_request,
        headers,
        runtime,
    )


def get_chunks_paginated(file_id: str = None, page_num: int = 1, page_size: int = 100):
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
        index_id=index_id,
        file_id=file_id,
        page_num=page_num,
        page_size=min(page_size, 100),  # 限制最大为100
    )

    res = client.list_chunks(workspace_id, request)
    return [node.text for node in res.body.data.nodes]


def get_all_chunks(file_id: str = None):
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
            chunks = get_chunks_paginated(
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


def upload(file_name: str, file_path: str, old_file_id=None) -> str:
    """上传知识库文件，如果已经存在，则更新"""
    try:
        logger.info(f"上传文件：{file_path}")
        logger.info("向阿里云百炼申请上传租约")
        lease_response = apply_lease(file_name, file_path)
        lease_id = lease_response.body.data.file_upload_lease_id
        upload_url = lease_response.body.data.param.url
        upload_headers = lease_response.body.data.param.headers

        logger.info("上传文档到阿里云百炼")
        upload_file(upload_url, upload_headers, file_path)

        logger.info("将文档添加到阿里云百炼服务器")
        add_response = add_file(lease_id)
        file_id = add_response.body.data.file_id

        logger.info("检查阿里云百炼中的文档状态")
        while True:
            describe_response = describe_file(file_id)
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
        index_add_response = submit_index_add_documents_job(file_id)

        job_id = index_add_response.body.data.id

        logger.info(f"获取阿里云百炼索引任务状态: {job_id}")
        while True:
            get_index_job_status_response = get_index_job_status(job_id)
            status = get_index_job_status_response.body.data.status
            logger.info(f"当前索引任务状态：{status}")
            if status == "COMPLETED":
                break
            time.sleep(1)
        if old_file_id:
            logger.info("删除旧文档")
            delete_index_document(old_file_id)
        logger.info("阿里云百炼知识库创建成功！")
        return file_id
    except Exception:
        raise ValueError("文档上传知识库异常")
