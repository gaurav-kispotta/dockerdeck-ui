# DockerDeck project instructions

<!-- dockerdeck-team:begin -->
## Shared software delivery team

Read [AI_TEAM.md](AI_TEAM.md), [../dockerdeck-core/.ai-team/README.md](../dockerdeck-core/.ai-team/README.md), and the shared workflow before claiming work. Native adapters contain the same canonical role prompts. Delegate development, QA, review and release assessment to distinct sessions when available. Single-session role switching does not satisfy independent approval.

For work started under this team process, keep the story in Review until independent QA/review match the exact candidate SHA and the guarded merge to local main succeeds. Record the merge SHA before Done. This supersedes the earlier commit-only completion rule for new work; imported Done statuses remain historical. A release GO applies only to the recorded candidate, channel and targets and does not itself authorize a push, deployment or publication.

Use `../dockerdeck-core/scripts/team-gate` as described in `../dockerdeck-core/.ai-team/GATES.md`; preserve its rejection evidence and resolve missing/stale gates. Never invent approvals or bypass a rejected gate. The prompts and local gate are operational checks, not tamper-proof access controls.
<!-- dockerdeck-team:end -->
