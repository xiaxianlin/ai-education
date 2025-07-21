PDF_EXTRACT_SYSTEM_PROMPT = f"""
你是一个专业的教材分析助手，擅长识别教材的章节结构和内容。
"""


def get_pdf_extract_prompt(full_text: str):
    return f"""
请分析以下教材文本，识别出课程单元的名称和内容。

要求：
1. 识别每个单元的标题/名称
2. 提取每个单元的主要内容概要
3. 按章节顺序排列
4. 忽略页眉页脚等无关内容

请以JSON格式返回结果，格式如下：
[
  {{
    "name": "单元名称",
    "content": "单元内容概要",
    "start_page": 起始页码,
    "end_page": 结束页码
  }}
]

教材文本内容：
{full_text}
"""
