class OSS:
    def exist(self, filepath: str):
        raise ValueError("OSS exist 未实现")

    def upload(self, filepath: str, data: bytes) -> str:
        raise ValueError("OSS upload 未实现")

    def multipart_upload(self, filepath: str, data: bytes) -> str:
        raise ValueError("OSS multipart_upload 未实现")

    def delete(self, filepath: str):
        raise ValueError("OSS delete 未实现")

    def get_file(self, filepath: str) -> bytes:
        raise ValueError("OSS get_file 未实现")

    def get_access_url(self, filepath: str, days: int) -> str:
        raise ValueError("OSS get_access_url 未实现")
