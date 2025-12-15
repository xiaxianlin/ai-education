import asyncio
import sys
import os

# Allow imports from apps/server
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import select
from shared.core.database import AsyncSessionLocal, Prompt, PromptVersion
from ai.question_generate.prompts.daily_practice import (
    DAILY_PRACTICE_PROMPT_ENGLISH, DAILY_PRACTICE_PROMPT_MATH, SYSTEM_PROMPT as DAILY_SYSTEM
)
from ai.question_generate.prompts.unit_practice import (
    UNIT_PRACTICE_PROMPT_ENGLISH, UNIT_PRACTICE_PROMPT_MATH, SYSTEM_PROMPT as UNIT_SYSTEM
)
from ai.question_generate.prompts.assessment import (
    ASSESSMENT_PROMPT_ENGLISH, ASSESSMENT_PROMPT_MATH, SYSTEM_PROMPT as ASSESSMENT_SYSTEM
)

prompts_data = [
    {
        "name": "每日练习-英语",
        "slug": "daily_practice_english",
        "category": "question_gen",
        "template": DAILY_PRACTICE_PROMPT_ENGLISH,
        "system_prompt": DAILY_SYSTEM,
    },
    {
        "name": "每日练习-数学",
        "slug": "daily_practice_math",
        "category": "question_gen",
        "template": DAILY_PRACTICE_PROMPT_MATH,
        "system_prompt": DAILY_SYSTEM,
    },
    {
        "name": "单元练习-英语",
        "slug": "unit_practice_english",
        "category": "question_gen",
        "template": UNIT_PRACTICE_PROMPT_ENGLISH,
        "system_prompt": UNIT_SYSTEM,
    },
    {
        "name": "单元练习-数学",
        "slug": "unit_practice_math",
        "category": "question_gen",
        "template": UNIT_PRACTICE_PROMPT_MATH,
        "system_prompt": UNIT_SYSTEM,
    },
    {
        "name": "能力评估-英语",
        "slug": "assessment_english",
        "category": "question_gen",
        "template": ASSESSMENT_PROMPT_ENGLISH,
        "system_prompt": ASSESSMENT_SYSTEM,
    },
    {
        "name": "能力评估-数学",
        "slug": "assessment_math",
        "category": "question_gen",
        "template": ASSESSMENT_PROMPT_MATH,
        "system_prompt": ASSESSMENT_SYSTEM,
    },
]

async def init_prompts():
    print("Initializing prompts...")
    async with AsyncSessionLocal() as db:
        for p_data in prompts_data:
            try:
                stmt = select(Prompt).where(Prompt.slug == p_data["slug"])
                existing = await db.scalar(stmt)
                if not existing:
                    print(f"Creating prompt: {p_data['name']}")
                    prompt = Prompt(
                        name=p_data["name"],
                        slug=p_data["slug"],
                        category=p_data["category"],
                        status="published",
                    )
                    db.add(prompt)
                    await db.flush()
                    
                    version = PromptVersion(
                        prompt_id=prompt.id,
                        version_no=1,
                        template=p_data["template"],
                        system_prompt=p_data["system_prompt"],
                        is_published=1,
                    )
                    db.add(version)
                    await db.flush()
                    prompt.current_version_id = version.id
                    await db.commit()
                else:
                    print(f"Prompt already exists: {p_data['name']}")
            except Exception as e:
                print(f"Error creating prompt {p_data['name']}: {e}")

if __name__ == "__main__":
    asyncio.run(init_prompts())
