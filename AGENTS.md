# DockerDeck project workflow

The canonical portfolio is `../dockerdeck-core/backlog/`. Use `../dockerdeck-core/scripts/backlog` from this repository (the wrapper resolves the core working directory). Read its `instructions overview` and the applicable workflow guide. `.stories/` preserves original story IDs and evidence; its metadata is historical after migration. Do not maintain the archived manual Kanban as a second live board.

## Story branches and check-in

- Read and claim a ready task before editing. Confirm dependencies and coordinate shared-file ownership.
- Create a branch named **exactly after the story ID** before implementation. Imported stories use their original ID, such as `CORE-001`, `UI-001` or `DESK-006`; new tasks use their native `DD-N` ID. Create developer branches from current local main only. Wait for prerequisites to merge to main before starting dependent implementation; record the main base SHA.
- Commit each completed story separately, including only its implementation, meaningful tests and relevant docs/story evidence. Record branch, commit hash and verification in the native task before Done. A local commit is not a push; never push or publish without authorization.
- Preserve unrelated working changes and untracked files. Do not force-update refs or silently bundle multiple stories. Every agent must use its own registered worktree. QA, reviewer, security and merge actors use separate detached worktrees at the committed candidate; never share a developer checkout.
- Review the actual user scenario and appropriate checks before acceptance. Keep known unrelated baseline failures explicit rather than disabling rules or claiming every product level passed.

## Independent QA

Testers ask the developer for a verified environment and record URL, build/source, ownership and runtime versions. Keep the environment owner active until testers finish, or use a persistent user-owned service. Real browser/Electron E2E, mocks and source checks must be labeled distinctly. Record PASS/FAIL/BLOCKED and reproducible evidence. Reproduce defects, search existing tasks, and create a bounded bug only when no existing task owns it.

Use synthetic Compose fixtures. Do not start arbitrary imported stacks or perform Docker mutations against the user's daemon as a testing shortcut. Clean up only owned test processes. Heavy raw traces and package binaries may remain ignored locally; retain repeatable scripts, results and reports.

Shared workflow and restart instructions: `../dockerdeck-core/BACKLOG_README.md`. Initial portfolio WIP limits are 3 active and 2 in review. Routine scoped implementation/check-in is already part of the user's workflow; do not add a separate permission checkpoint unless required for a concrete operation.

<!-- dockerdeck-team:begin -->
## Shared software delivery team

Read [AI_TEAM.md](AI_TEAM.md), [../dockerdeck-core/.ai-team/README.md](../dockerdeck-core/.ai-team/README.md), and the shared workflow before claiming work. Native adapters contain the same canonical role prompts. Delegate development, QA, review and release assessment to distinct sessions when available. Single-session role switching does not satisfy independent approval.

For work started under this team process, keep the story in Review until independent QA/review match the exact candidate SHA and the guarded merge to local main succeeds. Record the merge SHA before Done. This supersedes the earlier commit-only completion rule for new work; imported Done statuses remain historical. A release GO applies only to the recorded candidate, channel and targets and does not itself authorize a push, deployment or publication.

Use `../dockerdeck-core/scripts/team-gate` as described in `../dockerdeck-core/.ai-team/GATES.md`; preserve its rejection evidence and resolve missing/stale gates. Never invent approvals or bypass a rejected gate. The prompts and local gate are operational checks, not tamper-proof access controls.
<!-- dockerdeck-team:end -->
