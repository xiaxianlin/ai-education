---
description: "Standard procedure for adding a new frontend feature page"
---

1. **Define Page Model**: Create `pages/[Feature]/[PageName]/models/page.ts` using `unstated-next` to manage state and `ahooks`' `useRequest` for API calls.
2. **Implement View Components**:
   - Create `pages/[Feature]/[PageName]/views/Main.tsx` as the UI entry point.
   - Break down complex UI into sub-components in `pages/[Feature]/[PageName]/components/`.
3. **Create Page Entry**: Create `pages/[Feature]/[PageName]/index.tsx`.
   - Wrap the `Main` view with the `PageModel.Provider`.
4. **Update Routing**: Add the new page to the main router (usually `index.tsx` in `src/` or specific layout).
5. **Verify**: Run `pnpm dev:admin` or `pnpm dev:student` to test the UI.
