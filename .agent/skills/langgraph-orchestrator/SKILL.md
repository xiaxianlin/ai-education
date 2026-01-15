---
name: langgraph-orchestrator
description: "Specialized in building, debugging, and optimizing complex AI workflows using LangGraph."
---

# LangGraph Orchestrator Skill

This skill enables the creation and management of sophisticated AI generation and evaluation workflows.

## Core Capabilities

- **State Management**: Defining robust `TypedDict` states for multi-step processes.
- **Node Design**: Implementing atomic, reusable nodes with clear inputs and outputs.
- **Conditional Routing**: Managing flow branching based on AI evaluation or logic results.
- **Persistence**: Implementing checkpointing and persistence for long-running workflows.

## Examples

### Conditional Edge Implementation

```python
def should_continue(state: WorkflowState):
    if state.get("is_complete"):
        return END
    return "next_node"

workflow.add_conditional_edges("current_node", should_continue)
```

### Async Node with Error Handling

```python
async def generation_node(state: WorkflowState):
    try:
        response = await ai_client.generate(...)
        return {"result": response}
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        return {"error": str(e), "status": "failed"}
```
