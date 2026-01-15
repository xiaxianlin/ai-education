---
name: ui-component-builder
description: "Expert in building premium, responsive, and type-safe UI components using Ant Design 5 and shadcn/ui."
---

# UI Component Builder Skill

This skill focuses on creating visually stunning and maintainable UI components for both Admin and Student platforms.

## Core Capabilities

- **Ant Design 5 Expertise**: Deep understanding of AntD components and custom theme tokens.
- **shadcn/ui Mastery**: Expertly customizing Radix-based components for a premium feel.
- **State-based Styling**: Implementing complex Tailwind styles using state mapping instead of messy ternaries.
- **Responsive Design**: Ensuring flawless UX across desktop and mobile browsers.

## Examples

### State-mapped Tailwind Styling

```typescript
const STATUS_COLORS = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
  pending: "bg-blue-100 text-blue-700 border-blue-200",
};

export const StatusBadge = ({ status }) => (
  <span className={["px-2 py-1 rounded border", STATUS_COLORS[status]].join(" ")}>
    {status}
  </span>
);
```

### Ant Design Pro Table Integration

```typescript
const columns = [
  { title: "ID", dataIndex: "id", valueType: "text" },
  { title: "Name", dataIndex: "name", valueType: "text", search: true },
  {
    title: "Action",
    valueType: "option",
    render: (_, record) => [<a key="edit">Edit</a>]
  },
];
```
