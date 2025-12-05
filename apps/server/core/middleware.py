import json
from typing import Any
from fastapi.responses import Response


def drop_none(d):
    if isinstance(d, dict):
        return {k: drop_none(v) for k, v in d.items() if v is not None}
    elif isinstance(d, list):
        return [drop_none(v) for v in d]
    else:
        return d


class WrappedResponse(Response):
    def render(self, content: Any) -> bytes:
        return json.dumps(
            drop_none({"status": 0, "message": "success", "data": content}),
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
        ).encode("utf-8")
