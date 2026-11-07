# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- **This folder (UI-Prototype):** static UI prototypes whose purpose is screens for the Final Year Project (FYP) demo pictures. They do not need to be wired to a backend. Prefer whatever renders the screens most faithfully and fastest; if built as code, stay close to the production stack below so screens look true to the real app.
- **Production app (not in this folder):** Next.js 15 (App Router), Tailwind CSS, shadcn/ui, React Flow on the frontend; FastAPI (Python), PostgreSQL, Redis + RQ workers on the backend; Docker sandboxes for execution; GitHub OAuth and PyGithub for integration.

## Users

Primary users are **developers** who want to hand GitHub issue resolution off to an autonomous AI agent, and who need to trust that it won't break their repo or slip in malicious code. The app is multi-tenant B2B SaaS with three in-product roles per organization:

- **Member (Developer):** connects GitHub, starts runs, watches live progress, reviews security findings on their own runs, approves or rejects flagged changes, views the resulting PR link, views and exports their runs' audit logs.
- **Admin (Engineering Manager):** everything a Member can do, plus: invites and removes Members; views a dashboard of all sandbox runs in the organization; reviews security flags on any run in the organization; views aggregate LLM token usage and costs; views and exports audit logs for all runs in the organization.
- **Owner (Organization Owner, the person who buys the plan):** everything an Admin can do, plus: adds and removes Admins; promotes a Member to Admin or demotes an Admin to Member; transfers ownership to an existing Admin (the previous Owner becomes an Admin); suspends or deletes the organization, which immediately terminates all its active sandboxes.

Earlier drafts called these roles User / Admin / Super Admin; the requirements document's names (Member / Admin / Owner) are canonical. The SaaS operators themselves have no frontend UI; they work through database and DevOps tools.

## Product Purpose

Autonomous GitHub Resolver lets a developer pick a repo, an open issue and an LLM, and have an agent resolve the issue inside an isolated Docker sandbox and open a pull request. Success means a correct PR lands without the agent damaging the workspace and without unreviewed risky changes reaching the repo.

## Positioning

Other tools wrap an LLM in a loop. This product wraps the agent in a recovery and review layer aimed at the two main failures of coding agents: **reliability** (they break things) and **security** (they can be tricked into injecting malicious code). Its four pillars:

1. **Shadow Git Checkpointing:** before every bash command, the workspace is snapshotted into a shadow git repository on the host.
2. **Two-State Recovery:** when a command fails, files are restored and the conversation history is trimmed, returning to the exact state before the failure.
3. **Failure Attribution (FALAT):** after 5 consecutive failures, a diagnostic algorithm finds the root-cause step (e.g. a change at step 3 that broke step 88) and rolls back to that checkpoint.
4. **Provenance Diff Gate:** before a PR opens, the patch is scanned for new URLs, new dependencies and high-risk patterns (e.g. CI/CD file edits) that were not in the original repo; any hit pauses the run for human review.

## Operating Context

- Every role can sign in two ways: **email + password** (register with name, email and password; log in and out through a login form) or **GitHub OAuth**.
- **When GitHub is needed (decided 2026-11-08):** a GitHub connection is required to list the user's own and private repositories and to open pull requests. **Public repositories need no connection to run:** the user pastes a public repository URL, Resolver clones it and reads its open issues without the user's account. The connection is asked for only when a pull request is ready to open; if the user can't write to the repository, the PR opens from a fork under their account. Without connecting, the approved change can be downloaded as a patch file. Onboarding lets the user skip connecting GitHub.
- Forgotten passwords are reset through a secure, time-limited link sent to the registered email.
- Every role can view and update their own account details: name, email, profile picture.
- A user who creates an Organization automatically becomes its Owner. Admins and the Owner invite Members by GitHub username.
- A run starts from a New Run flow: repo (from the connected GitHub account), open issue from that repo, LLM from the supported list (e.g. Claude Sonnet, GPT-4o). The run can't start until every field is chosen. Starting it clones the repo into an isolated Docker container and runs the agent there.
- A run is watched live: progress and sandbox logs stream in real time over Server-Sent Events.
- A run flagged by the diff gate sits in `awaiting_review` until a human approves or rejects it. After approval, the user sees the generated GitHub PR link.
- Organizations are strictly isolated by `organization_id`; one company never sees another's code.
- The system supports at least 3 concurrent background agent runs on a single host, so several runs can be live at once.

## Capabilities and Constraints

**Authentication & account**
- Register, log in and log out with email + password; log in with GitHub OAuth.
- Password reset by time-limited email link.
- Profile page: name, email, profile picture.

**Run initiation**
- Pick repo, then open issue, then LLM; start is disabled until all three are chosen. The repo comes from the connected account's list or from a pasted public repository URL (no connection needed).

**Live Execution Dashboard (the core screen)**
- Step tree of every command the agent runs, with step-by-step details.
- Step history where rolled-back steps are visibly distinct from completed steps (e.g. strike-through or an undo marker), since files were reverted and agent memory trimmed.
- Live terminal with the current command's raw stdout and stderr streamed from the sandbox.
- Run metadata: elapsed time, current step number, live token usage.
- Cancel Run immediately kills the Docker container and destroys the sandbox.

**Security findings & review gate**
- Security findings list per run: provenance flags, new-URL alerts, new-dependency alerts, high-risk patterns.
- Blocking review showing: what was flagged (e.g. "New URL found: http://attacker.com"), where it came from (e.g. "Extracted from Step 4: agent read an untrusted log file"), and the exact red/green code diff.
- Decision is Approve (change goes into the PR, PR opens) or Reject (run is killed, repo untouched).
- Anti-laundering rule: the agent can never approve its own changes; a human must decide.
- Then: link to the generated GitHub pull request.

**Audit logs & compliance**
- Append-only log; every step and security decision carries a SHA-256 hash chained to the previous entry (tamper-evident).
- View and export a run's logs and audit trail as JSON or CSV; Admins and the Owner can do this for every run in the organization.

**Organization administration**
- Org runs dashboard: all sandbox runs created by the organization's users, with team success rates.
- Aggregate LLM token usage and costs.
- Member management: invite and remove Members (Admin, Owner); add, remove, promote and demote Admins (Owner only).
- Ownership transfer to an existing Admin (Owner only).
- Suspend or delete the organization, terminating all active sandboxes (Owner only; destructive, so it needs a deliberate confirmation).

**Guardrails**
- Agent runs in a read-only, non-root Docker container with `--network none`; no internet or host access.
- All secrets are masked (in logs and output); the system scans for prompt injections and unauthorized dependencies.

**Requirement priority** (from the FYP requirements table): *Intermediate* — password reset, profile editing, rolled-back step distinction in history, token usage and costs, ownership transfer. Everything else is *Core*.

**Open / undecided**
- Plans, pricing and billing screens are not defined.
- The expansion of the "FALAT" acronym is not recorded here.

## Brand Commitments

- Product name: **Autonomous GitHub Resolver**.
- **Visual standard (user's choice, 2026-11-07):** the category standard played straight, at full craft. It should sit alongside **Vercel, GitHub, Stripe and Supabase**: crisp, minimal and developer-native like Vercel/GitHub, with the rich accent colour, data visuals and premium finish of Stripe/Supabase.
- **Rejected by the user:** metaphor-driven or gimmicky worlds (lab notebook, boarding pass, spectrogram, orienteering map), pale low-contrast pages, dull colour, messy or overly dense layouts.

## Evidence on Hand

- Source documents: the user's project summary, and the FYP functional/non-functional requirements (Tables 2.1 and 2.2).
- No real customers, testimonials, benchmarks, success-rate figures or press exist. Prototype screens may use clearly illustrative sample data (repos, issues, steps, tokens, costs), but must not present invented figures as real results or claim real customers.
- No brand assets are in this folder.

## Product Principles

1. **Trust is the product.** Every screen should make it obvious what the agent did, what was undone and why; nothing important happens silently.
2. **Humans hold the gate.** Risky changes stop and wait for a person; the UI makes the decision clear, evidenced and impossible to skip.
3. **Recovery is visible, not hidden.** Rollbacks and root-cause jumps are a feature to show, not an error to bury.
4. **Provenance over assertion.** Show where a change or flag came from (which step, which input), not just that it exists.
5. **Isolation by default.** Users only ever see their own organization's data, and each role sees only what its permissions allow.

## Accessibility & Inclusion

- Desktop-first: the interface must be responsive across desktop and laptop screen sizes (NFR 6). Phone layouts are not required.
- Run status and execution state must be clearly readable at a glance in real time (NFR 5); state must never rely on colour alone, since pass/fail/rolled-back/flagged are the core signals.
