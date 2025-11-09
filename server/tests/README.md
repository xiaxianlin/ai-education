# 测试说明

## 安装测试依赖

```bash
cd /Users/xiaxianlin/projects/ai-education/server
uv sync
# 或者
pip install pytest pytest-asyncio
```

## 运行测试

### 运行所有测试
```bash
pytest tests/
```

### 运行特定测试文件
```bash
pytest tests/test_aliyun.py
```

### 运行特定测试类
```bash
pytest tests/test_aliyun.py::TestAliyunAIService
```

### 运行特定测试方法
```bash
pytest tests/test_aliyun.py::TestAliyunAIService::test_asr_success
```

### 显示详细输出
```bash
pytest tests/test_aliyun.py -v
```

### 显示覆盖率
```bash
pytest tests/test_aliyun.py --cov=ai.services.aliyun --cov-report=html
```

## 测试覆盖

`test_aliyun.py` 包含以下测试：

### ASR (语音识别) 测试
- ✅ `test_asr_success`: 测试成功场景
- ✅ `test_asr_failure`: 测试失败场景
- ✅ `test_asr_default_language`: 测试默认语言参数
- ✅ `test_asr_status_code_200_but_code_not_success`: 测试边界情况

### TTS (文本转语音) 测试
- ✅ `test_tts_success`: 测试成功场景
- ✅ `test_tts_failure`: 测试失败场景
- ✅ `test_tts_default_parameters`: 测试默认参数

### 图片生成测试
- ✅ `test_generate_image_success`: 测试成功场景
- ✅ `test_generate_image_without_size`: 测试不指定尺寸
- ✅ `test_generate_image_failure`: 测试失败场景
- ✅ `test_generate_image_partial_size`: 测试部分尺寸参数
- ✅ `test_generate_image_status_code_200_but_code_not_success`: 测试边界情况

## 测试特点

- 使用 `unittest.mock` 模拟 dashscope API 调用
- 测试成功和失败场景
- 测试默认参数
- 测试边界情况
- 验证 API 调用参数
- 验证返回值和异常处理

