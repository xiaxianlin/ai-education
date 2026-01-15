---
description: "Standard procedure for implementing a new LangGraph-based AI feature"
---

1. **Define State**: Create a `TypedDict` for the workflow state in `apps/server/shared/generation/[feature]/graph.py`.
2. **Implement Nodes**: Define async functions for each node (e.g., `load_context`, `generate_answer`, `format_result`).
3. **Build Graph**:
   - Initialize `StateGraph`.
   - Add nodes and edges.
   - Set entry and exit points.
4. **Compile Graph**: Use `workflow.compile()`.
5. **Implement Service Entry**: Create an `invoke_workflow` function to wrap the graph execution.
6. **Integration**: Call the service from the route or background worker.
