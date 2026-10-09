# Automation

All additions and updates reach `main` through pull requests. Hand-edited pull
requests are accepted, including edits to existing records. Merging approves the
pinned artifact; publishing serves only records already on `main`.

| Workflow | Trigger | Work |
| --- | --- | --- |
| `submit.yml` | Issue opened, edited, reopened or labeled; recovery at :07/:37 UTC; manual | Open a PR with submission details for review. |
| `bump.yml` | 05:17 and 17:17 UTC; manual | Propose new npm versions. Git updates are manual. |
| `validate.yml` | PRs and pushes to main | Test the registry and validate completed records. |
| `publish.yml` | Relevant main changes; daily; manual | Publish approved pinned records. |

Intake parses the source and carries author-supplied references and categories into
`submissions/<issue>.json`. It does not download plugins, require Git tags, verify
ownership, or run registry publication checks before creating the PR. Missing
categories are completed by the reviewer. The submission file is review input;
it is removed when the reviewer writes the approved record.

Edits retry issues that have no PR. Scheduled recovery processes open submission
issues that never reached a PR, including old failures. Manual dispatch accepts
an issue number or recovers all waiting submissions when omitted:

```sh
gh workflow run submit.yml
gh workflow run submit.yml -f issue_number=123
```

Existing PR branches are left alone, including reviewer edits. Closed issues and
issues without the submission label are skipped. Existing closed or merged PRs
are not recreated. For a new manual Git update, open a new submission issue.
The reviewer reads subsequent comments and issue edits.

Invalid source text receives a correction request; service failures receive an
acknowledgement and automatic retry. Neither creates a maintainer hold. Repeated
identical intake messages are suppressed.

npm package files come from one cached tarball per version, verified against
npm's SHA-512 before reading. No package code runs, and files are read to stdout
without extracting paths or links onto disk. npm manifests and overviews come
from that tarball; GitHub files come from the pinned commit and plugin directory.
Published asset URLs still use jsDelivr for npm and raw GitHub URLs for Git.

## Tokens and repository setup

- Use the default `GITHUB_TOKEN`. Enable Actions' permission to create pull requests.
- Submission creation runs only intake sanity checks. The reviewer resolves the artifact and runs trusted publication validation after completing the record. npm bump PRs retain validation evidence inside a collapsed details section.
- `GITHUB_TOKEN` PRs do not trigger `validate.yml`. Do not require the Validate status check until bot PRs trigger it. Hub receives App webhooks, so this limitation does not prevent Hub review.
- `PLUGINS_BOT_TOKEN` is optional. If set, both checkout/push and `gh` use it so downstream PR validation can run. Grant contents, issues, and pull-requests write access.
- Creation workflows create their `submission` or `bump` label and `needs-maintainer` idempotently. No manual label bootstrap is needed; a manual run provisions them before the first submission.
- Install the `paseo-bot` App on `getpaseo/plugins`. Main branch protection must allow that App to merge.
- Require pull requests for main. Configure CODEOWNERS review for protected paths if desired; the file alone does not enable branch protection.
- Enable GitHub Pages with GitHub Actions as its source.

## Reviewer

The `paseo-plugin-review` trigger runs every 30 minutes. Its private operating
configuration owns timing and execution; [REVIEW.md](REVIEW.md) on main owns
acceptance. Never use the PR head's policy to judge its own changes.

The reviewer handles a single submission file and its eventual plugin record and
overview, or an existing record update. Infrastructure changes remain repository
maintenance. For Git, resolve the supplied ref or current `main` commit during
review. Review and store the exact commit before merging. A release tag is optional.
Git updates are considered only when submitted manually.

Every public review outcome mentions the human submitter, including approvals.
For an automation-created PR, use the linked issue author or recorded
`submittedBy`, not the automation account. Read public replies before deciding
what remains. The reviewer owns listing edits, ordinary decisions and author
follow-up; credible serious safety decisions alone need maintainer escalation.

Keep the visible PR body to the plugin name, version change and review status.
Artifact hashes, JSON, diffs and validation instructions belong in collapsed
details. Review evidence belongs under a separate collapsed review-data section.

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

Read the extracted manifest, package.json, README, and shipped source. Optional repository source can help explain a package; matching it is not a requirement. On bumps, inspect
both artifacts and compare them with `diff -ruN`; the PR body's diff is a claim.

For Git, set `artifact_remote` and `artifact_commit` from the record:

```sh
inspection_dir=$(mktemp -d)
git clone --no-checkout --no-recurse-submodules -- "$artifact_remote" "$inspection_dir/repository"
git -C "$inspection_dir/repository" checkout --detach "$artifact_commit"
```

If a tag is recorded, verify it points to that commit. Read `paseo-plugin.json` and source under
`artifact.pluginPath`, or the repository root when absent. Do not initialize
submodules or execute anything in the checkout. Record unresolved dependencies
and references in the review.
