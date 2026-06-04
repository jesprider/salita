# Hill chart fixtures

## `hill-chart-import-demo.json`

Sample **tracker-import** shaped JSON for manual testing of **Import** on `/projects`.

**How to use**

1. Open the app with demo sample data (fresh profile or `demo: true` in storage).
2. Click **Import** (or drag this file onto the overview).
3. Confirm replacing demo data when prompted.
4. You should see two projects: **Platform API migration** and **Customer onboarding refresh** (distinct from the built-in sample).

The file is validated in CI via `src/schema/validate.test.ts`.
