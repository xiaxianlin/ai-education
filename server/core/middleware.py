from fastapi.responses import JSONResponse
from typing import Any
import json


class ExcludeNoneJSONResponse(JSONResponse):
    def render(self, content: Any) -> bytes:
        # 使用 dict 排除 None，再转 JSON
        def exclude_none(obj):
            if isinstance(obj, dict):
                return {k: exclude_none(v) for k, v in obj.items() if v is not None}
            elif isinstance(obj, list):
                return [exclude_none(i) for i in obj]
            return obj

        filtered = exclude_none(content)
        return json.dumps(
            filtered, ensure_ascii=False, allow_nan=False, indent=None, separators=(",", ":")
        ).encode("utf-8")
