from langchain_openai import ChatOpenAI
from shared.core.settings import envs


def get_chat_client(model_name="qwen3-max-preview", temperature=0.7):
    return ChatOpenAI(
        model_name=model_name,
        temperature=temperature,
        openai_api_key=envs.AI_PLATFORM_KEY,
        openai_api_base=envs.AI_PLATFORM_URL,
    )

