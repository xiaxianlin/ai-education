# AI Helper

### Install

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv
source .venv/bin/activate
```

### Run
```sh
uv sync
uv run main.py
```

- patch: 字段修改，使用 udpate_xxx
- put: 全量修改，使用 modify
- 搜索使用 search
- 通过「id」查询用 get
- 通过「字段」单个查询用 find_by_xxx
- 通过「字段」批量查询用 query_by_xxx