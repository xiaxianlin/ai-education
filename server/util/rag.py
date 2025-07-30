import time
from aliyun.rag import AliyunRag
from core.logger import get_logger

logger = get_logger("util.rag")


def update(file_name: str, file_path: str, old_file_id=None) -> str:
    try:
        logger.info(f"上传文件：{file_path}")
        service = AliyunRag()

        logger.info("向阿里云百炼申请上传租约")
        lease_response = service.apply_lease(file_name, file_path)
        lease_id = lease_response.body.data.file_upload_lease_id
        upload_url = lease_response.body.data.param.url
        upload_headers = lease_response.body.data.param.headers

        logger.info("上传文档到阿里云百炼")
        service.upload_file(upload_url, upload_headers, file_path)

        logger.info("将文档添加到阿里云百炼服务器")
        add_response = service.add_file(lease_id)
        file_id = add_response.body.data.file_id

        logger.info("检查阿里云百炼中的文档状态")
        while True:
            describe_response = service.describe_file(file_id)
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
        index_add_response = service.submit_index_add_documents_job(file_id)

        job_id = index_add_response.body.data.id

        logger.info(f"获取阿里云百炼索引任务状态: {job_id}")
        while True:
            get_index_job_status_response = service.get_index_job_status(job_id)
            status = get_index_job_status_response.body.data.status
            logger.info(f"当前索引任务状态：{status}")
            if status == "COMPLETED":
                break
            time.sleep(1)
        if old_file_id:
            logger.info("删除旧文档")
            service.delete_index_document(old_file_id)
        logger.info("阿里云百炼知识库创建成功！")
        return file_id
    except Exception as e:
        logger.error(str(e))
        raise ValueError("文档上传知识库异常")
