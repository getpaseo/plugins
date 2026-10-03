# Automation

All additions and updates reach `main` through pull requests. Hand-edited pull
requests are accepted, including edits to existing records. Merging approves the
pinned artifact; publishing serves only records already on `main`.

| Workflow       | Trigger (UTC)                                                        | Work                                                                                                    |
| -------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `submit.yml`   | Issues opened, edited, or labeled; 02:23, 10:23, 18:23 daily; manual | Pin submissions and open a PR linked to the issue. Retry missed issues and update open PRs after edits. |
| `bump.yml`     | 05:17 and 17:17 daily; manual                                        | Open one PR per new pinned version, naming `submittedBy` and including an artifact diff.                |
| `validate.yml` | Every PR, including existing-record edits; every push to main        | Run tests and online pin validation.                                                                    |
| `publish.yml`  | Relevant changes merged to main; 06:41 daily; manual                 | Build static documents and publish them through GitHub Pages.                                           |

Submission retries reuse one branch per issue. A content digest avoids repeated
PR updates for unchanged issues; merged or closed PRs are not recreated by the
submission workflow. The reviewer owns reopening stale reviews.

## Tokens and repository setup

- Use the default `GITHUB_TOKEN`. Enable Actions' permission to create pull requests.
- Both creation workflows run `npm test` and `node scripts/validate.ts --online --changed` inline after committing the candidate and before pushing or creating its PR. A failure stops that PR. The PR body records successful validation.
- `GITHUB_TOKEN` PRs do not trigger `validate.yml`. Do not require the Validate status check until bot PRs trigger it. Hub receives App webhooks, so this limitation does not prevent Hub review.
- `PLUGINS_BOT_TOKEN` is optional. If set, both checkout/push and `gh` use it so downstream PR validation can run. Grant contents, issues, and pull-requests write access.
- Creation workflows create their `submission` or `bump` label and `needs-maintainer` idempotently. No manual label bootstrap is needed; a manual or scheduled run provisions them before the first submission.
- Install the `paseo-bot` App on `getpaseo/plugins`. Main branch protection must allow that App to merge.
- Require pull requests for main. Configure CODEOWNERS review for protected paths if desired; the file alone does not enable branch protection.
- Enable GitHub Pages with GitHub Actions as its source.

## Reviewer

The disabled trigger is **paseo-plugin-review**, in
`~/dev/skills/hub/.paseo/triggers/scheduled-plugin-review.yml`. That file owns
selection, timing, labels, GitHub commands, reports, and outcomes. [REVIEW.md](REVIEW.md)
on `main` owns judgment. Never use the PR head's policy to judge its own changes.

One bot performs both Security and advisory Quality review. Its hourly schedule
at :12 (Europe/Berlin) exceeds the two-to-three-times-daily review expectation;
Actions schedules own submission and bump creation. The trigger remains
`enabled: false` until activation is approved.

Only exactly one changed `plugins/<owner>/<slug>.json` file is eligible for
automatic merge. Multiple records, deletions, owner changes, `.github/`, `scripts/`,
`REVIEW.md`, `PROTOCOL.md`, `categories.json`, and all other changes are
maintainer-only. CODEOWNERS covers the policy and automation paths; the bot checks
the complete changed-file list and never edits a record.

Changes-requested PRs close after 14 days without a new commit or comment. A new
commit or comment reopens a stale closure on the next run. For a malicious bump,
close the PR and create one deduplicated `Delist <id>?` issue labeled
`needs-maintainer`. The reviewer never delists.

## Static artifact inspection

Use a temporary directory. Take URLs, hashes, and commits from the validated
record; quote every shell variable. These commands inspect files and do not run
plugin code. The registry's trusted validation script is separate from plugin
inspection. Never run `npm install`, `npm pack`, `node`, lifecycle scripts, or a
build inside a plugin artifact.

For npm, set `artifact_url` to `artifact.resolved` and `expected_integrity` to
`artifact.integrity`, then:

```sh
inspection_dir=$(mktemp -d)
curl --fail --location --proto '=https' --proto-redir '=https' "$artifact_url" -o "$inspection_dir/artifact.tgz"
actual_integrity="sha512-$(openssl dgst -sha512 -binary "$inspection_dir/artifact.tgz" | openssl base64 -A)"
test "$actual_integrity" = "$expected_integrity" || exit 1
tar -tzf "$inspection_dir/artifact.tgz"
tar -tvzf "$inspection_dir/artifact.tgz"
# Inspect the listing before extraction: reject absolute paths, traversal, and escaping links.
mkdir "$inspection_dir/artifact"
tar -xzf "$inspection_dir/artifact.tgz" -C "$inspection_dir/artifact" --no-same-owner --no-same-permissions
```

Read the extracted manifest, package.json, README, and shipped source. Compare
with repository source at `repository.commit` when provided. On bumps, inspect
both artifacts and compare them with `diff -ruN`; the PR body's diff is a claim.

For Git, set `artifact_remote` and `artifact_commit` from the record:

```sh
inspection_dir=$(mktemp -d)
git clone --no-checkout --no-recurse-submodules -- "$artifact_remote" "$inspection_dir/repository"
git -C "$inspection_dir/repository" checkout --detach "$artifact_commit"
```

Verify the tag points to that commit. Read `paseo-plugin.json` and source under
`artifact.pluginPath`, or the repository root when absent. Do not initialize
submodules or execute anything in the checkout. Record unresolved dependencies
and references in the review.
