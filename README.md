## Take-Home: Campaign (Project) Feature

### Goal

Implement a **Campaign** (or "Project") entity that belongs to a **team**. Logged-in users can create, list, and manage campaigns for their team. Complete this within one day using the existing stack (Next.js, Drizzle, Postgres, server actions, dashboard UI).

### What to Implement

#### 1. Data Model

- Add a **`campaigns`** table with at least:
  - `id` (primary key)
  - `team_id` (foreign key to `teams`) — campaigns are scoped to a team
  - `name` (required, e.g. varchar 100)
  - `status` (required) — e.g. `'draft' | 'active' | 'completed'`
  - `created_at` (timestamp, default now)
- Add the table to the Drizzle schema, define relations to `teams`, and create and run a migration.

#### 2. Backend

- **Queries:** In `lib/db/queries.ts` (or equivalent), add a function that returns all campaigns for the current user's team. Reuse the existing pattern: get the current user (e.g. `getUser()`), resolve their team (e.g. `getUserWithTeam(user.id)`), then query campaigns where `team_id` equals that team's id. Order by `created_at` (e.g. newest first).
- **Server actions:** Implement server actions for:
  - **Create campaign:** Accept at least `name` (and optionally `status`). Validate input (e.g. with Zod). Ensure the current user belongs to a team, then insert a row into `campaigns` with that `team_id`. Follow existing patterns (e.g. `validatedActionWithUser`, `getUserWithTeam`, `logActivity` if you use it elsewhere).
  - **Update campaign status (optional but recommended):** Accept `campaignId` and new `status`. Verify the campaign belongs to the current user's team, then update the row.
- **API (optional):** If you prefer, expose the list of campaigns via an API route (e.g. extend `/api/team` or add a new route) that returns the same data, so the dashboard can fetch it with SWR or fetch. Alternatively, the list can be loaded in a Server Component and passed as props; either is fine.

#### 3. Dashboard UI

- **Campaigns section:** On the dashboard (the same page that shows Team Subscription and Team Members), add a **"Campaigns"** (or "Projects") section.
  - **List:** Show the current team's campaigns in a list or table. For each campaign, display at least: name, status, and created date. Use the same UI patterns as the rest of the app (e.g. `Card`, `CardHeader`, `CardTitle`, `CardContent`).
  - **Create form:** In the same section (or a modal), add a form to create a campaign: required field "Name" and optionally an initial "Status" (defaulting to `draft`). On submit, call your create-campaign server action, then refresh the list (e.g. revalidate or mutate SWR).
  - **Update status (optional):** For each campaign row, allow changing the status (e.g. dropdown or buttons: draft → active → completed) and call your update-status action, then refresh the list.
- **Empty state:** When the team has no campaigns, show a short message (e.g. "No campaigns yet") and the create form or a clear "Create campaign" action.

#### 4. Authorization and Consistency

- Every campaign operation must be **team-scoped:** only allow access to campaigns whose `team_id` matches the current user's team. Use the same "get current user → get user's team" pattern used elsewhere; do not allow creating or updating campaigns for other teams.
- Keep the app consistent: use existing patterns for server actions (validation, error/success return shape), UI components, and data fetching (SWR or Server Components).

### Out of Scope (Do Not Implement)

- No need to change Stripe, auth, or invitations.
- No need to add delete campaign unless you have time; focus on create, list, and (optional) update status.
- No need to add pagination; a single list of campaigns for the team is enough.

### Deliverables

- Code that implements the above (schema, migration, queries, server actions, dashboard UI).
- Short README or comment describing how to run migrations and how to use the new "Campaigns" section (e.g. where to find it and what each action does).

### Evaluation (What We Look At)

- Correct team-scoped data model and authorization.
- Clear, consistent use of the existing stack (Drizzle, server actions, dashboard patterns).
- Working create + list (and optionally update status) with a clear, understandable UI.

---
