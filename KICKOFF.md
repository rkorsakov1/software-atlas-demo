# Kickoff prompt for Claude Code

## Setup (once)
1. Create an empty project folder and copy in: `CLAUDE.md`, `research.md`, `.claude/agents/` (all six files), and this file.
2. Recommended: save the original project brief as `docs/BRIEF.md`.
3. Make sure Claude Code has network access (npm registry, SEC EDGAR, company IR sites, docs sites) and permission to run `npm` commands.
4. Start Claude Code in that folder. Check that the subagents are discovered (ask: "list the project subagents").

## Paste this as the first message

```
You are the orchestrator for The Software Atlas. Read CLAUDE.md fully, then research.md, then every file in .claude/agents/.

Execute the orchestration plan in CLAUDE.md §8, phase by phase:
- Phase A yourself. Do not start Phase B/C until Gate A passes.
- Phases B and C with subagents via the Task tool, launching independent tasks in parallel in a single message. Respect the file-ownership table in §3.
- Phase D with qa-reviewer, then dispatch fixes to owning agents and re-run QA until there are no P0/P1 findings.

Before Phase A, reply with: (1) a short plan confirming phases, agents, and parallel batches; (2) any contradictions or ambiguities you found between CLAUDE.md and research.md; (3) the dependency versions you intend to pin. Then proceed without waiting unless you found a blocking contradiction.

After each gate, give me a 5-line status: what passed, counts (data volumes by confidence), open issues, next batch.

Hard rules: never fabricate sources, URLs or figures; no TODOs or placeholders; follow the code conventions in CLAUDE.md §1.2 exactly; finish only when every item in CLAUDE.md §9 is checked with evidence.
```

## Resuming in a new session
```
Resume The Software Atlas. Read CLAUDE.md, docs/qa-report.md and docs/verification-log.md, run the gate commands, report the current phase and failing checks, then continue the orchestration plan from there.
```
