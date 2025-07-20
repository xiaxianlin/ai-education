import chardet
import os
from typing import Optional
from core import get_logger


logger = get_logger("EncodingUtils")


class EncodingUtils:
    """文件编码处理工具类"""
    
    @staticmethod
    def detect_encoding(file_path: str) -> Optional[str]:
        """检测文件编码"""
        try:
            with open(file_path, 'rb') as f:
                raw_data = f.read()
                result = chardet.detect(raw_data)
                return result.get('encoding')
        except Exception as e:
            logger.error(f"Error detecting encoding for {file_path}: {str(e)}")
            return None
    
    @staticmethod
    def read_file_safe(file_path: str, encoding: str = None) -> Optional[str]:
        """安全读取文件内容，自动处理编码"""
        if not encoding:
            encoding = EncodingUtils.detect_encoding(file_path)
        
        if not encoding:
            encoding = 'utf-8'  # 默认使用UTF-8
        
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                return f.read()
        except UnicodeDecodeError:
            # 尝试其他常见编码
            encodings = ['utf-8', 'gbk', 'gb2312', 'big5', 'latin1']
            for enc in encodings:
                if enc != encoding:
                    try:
                        with open(file_path, 'r', encoding=enc) as f:
                            logger.info(f"Successfully read {file_path} with encoding {enc}")
                            return f.read()
                    except UnicodeDecodeError:
                        continue
            
            logger.error(f"Failed to read {file_path} with any encoding")
            return None
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {str(e)}")
            return None
    
    @staticmethod
    def write_file_utf8(file_path: str, content: str) -> bool:
        """以UTF-8编码写入文件"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            logger.error(f"Error writing file {file_path}: {str(e)}")
            return False
    
    @staticmethod
    def convert_to_utf8(file_path: str, backup: bool = True) -> bool:
        """将文件转换为UTF-8编码"""
        # 读取原文件内容
        content = EncodingUtils.read_file_safe(file_path)
        if content is None:
            return False
        
        # 备份原文件
        if backup:
            backup_path = f"{file_path}.bak"
            try:
                import shutil
                shutil.copy2(file_path, backup_path)
                logger.info(f"Backup created: {backup_path}")
            except Exception as e:
                logger.warning(f"Failed to create backup: {str(e)}")
        
        # 写入UTF-8编码文件
        return EncodingUtils.write_file_utf8(file_path, content)
    
    @staticmethod
    def fix_garbled_text(text: str) -> str:
        """尝试修复乱码文本"""
        # 常见的乱码修复映射
        fixes = {
            # 这里可以添加常见的乱码修复规则
            'â€™': "'",
            'â€œ': '"',
            'â€\x9d': '"',
            'â€¦': '…',
        }
        
        for garbled, correct in fixes.items():
            text = text.replace(garbled, correct)
        
        return text
    
    @staticmethod
    def scan_project_encoding_issues(project_root: str, extensions: list = None):
        """扫描项目中的编码问题"""
        if extensions is None:
            extensions = ['.py', '.txt', '.md', '.json']
        
        issues = []
        
        for root, dirs, files in os.walk(project_root):
            # 跳过一些常见的目录
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['__pycache__', 'node_modules']]
            
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    file_path = os.path.join(root, file)
                    encoding = EncodingUtils.detect_encoding(file_path)
                    
                    if encoding and encoding.lower() not in ['utf-8', 'ascii']:
                        issues.append({
                            'file': file_path,
                            'encoding': encoding,
                            'relative_path': os.path.relpath(file_path, project_root)
                        })
        
        return issues