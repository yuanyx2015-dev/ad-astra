# Repository workflow

- Never commit directly to `main`, force-push it, rewrite it, reset it, or delete it.
- If `main` is the only available working branch, create and switch to a new `codex/<task>` branch before changing files.
- Use ordinary append-only commits. Create a commit after each important application function is complete and verified.
- Do not amend, rebase, squash, or otherwise rewrite commits that have already been pushed.
- Push working branches to `origin` and merge them into `main` through a pull request only after relevant tests pass.
- Never merge a pull request into `main` without my explicit instruction. Open the PR and stop for review.
- Never delete a local or remote working branch until its commits are confirmed present in `origin/main` after the merge.
- Never use force push on any branch.
