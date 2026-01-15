---
name: sqlalchemy-expert
description: "Expert in SQLAlchemy 2.0 asynchronous ORM, migration handling, and query optimization."
---

# SQLAlchemy Expert Skill

This skill provides advanced capabilities for managing the data layer of the `ai-education` project.

## Core Capabilities

- **SQLAlchemy 2.0 ORM**: Expert usage of `Mapped`, `mapped_column`, and `relationship`.
- **Async Queries**: Optimization of `select()` queries using `joinedload`, `selectinload`, and `scalars()`.
- **Complex Filtering**: Building dynamic filters using `and_`, `or_`, and `case`.
- **Managed Sessions**: Correct handling of `AsyncSession` with dependency injection.

## Examples

### Efficient Relationship Fetching

```python
from sqlalchemy.orm import selectinload
from shared.core.database import PracticeSession

# Fetch session with associated questions and answers
query = select(PracticeSession).options(
    selectinload(PracticeSession.questions),
    selectinload(PracticeSession.answers)
).where(PracticeSession.id == session_id)
```

### JSON Column Updates

```python
from sqlalchemy.orm.attributes import flag_modified

# Explicitly mark JSON field as modified for partial updates
question.content["metadata"]["updated"] = True
flag_modified(question, "content")
await db.commit()
```
