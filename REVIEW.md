# Review policy

This is the bar every pull request to the registry has to clear before it merges. A
maintainer and the review bot read the same text; a decision that is not grounded in a
section here is not a registry decision. The bot reads this file from `main`, never from
the pull request under review.

A listing is a promise to Paseo users: the pinned artifact is what the record says it is,
it does what the overview says it does, and it does nothing a plugin of its stated purpose
has no business doing. Review establishes those three things from the artifact itself. The
repository, the README, and the submitter's description are claims about the artifact;
the artifact is the evidence.

## What is reviewed

The pinned artifact at the exact pin in the record, fetched without executing anything:

- npm: the tarball at `artifact.resolved`, after its SHA-512 matches `artifact.integrity`
  and the version and integrity match what npm reports for the package.
- git: the tree at `artifact.commit` on `artifact.remote`, under `artifact.pluginPath`
  when set, after the commit is confirmed to exist on that remote.

Nothing in the artifact is installed, built, required, imported, or run. `npm install`,
`npm pack`, `node`, and any build step on the artifact are out of bounds for review.

## Pin

The record is only valid when the pin holds:

- The version is exact and the integrity matches npm. A pin that npm no longer serves, or
  serves with a different integrity, is rejected.
- A git commit is a full 40-character hash reachable on the remote. A tag that has moved
  away from the pinned commit is rejected until the pin is updated.
- `paseo-plugin.json` exists at the artifact root, or under `pluginPath`.
- The record's `id` owner is the GitHub owner of the source repository.
- Ownership: npm provenance names the declared repository, or the submitter is the
  repository owner or a public member of its organization.

`node scripts/validate.ts --online --changed` checks these mechanically and is run in
every review, because pull requests opened by the registry's own workflows do not trigger
the Validate workflow.

## Content

Each of the following is read in the extracted artifact and reported with a file and line
when present. The plugin's stated purpose, from its manifest description and overview, is
what each is judged against.

- Lifecycle scripts: `preinstall`, `install`, `postinstall`, `prepare`, or any script
  Paseo would run on install. A plugin has no reason to run code at install time.
- Dependencies: each runtime dependency, what it is for, and whether it is what the plugin
  needs. Unused, typosquatted, or unpinned-to-a-fork dependencies are rejected.
- Network: every outbound host the code can reach. Each one is justified by the purpose
  (a GitHub plugin reaching api.github.com) or the plugin is rejected.
- Credentials and environment: every read of environment variables, credential files,
  keychains, tokens, or other plugins' storage. Each one is justified by the purpose or the
  plugin is rejected.
- Filesystem: writes outside the plugin's own storage, and reads of user files the purpose
  does not need.
- Execution: `child_process`, `eval`, `new Function`, dynamic `import()` of remote or
  computed paths, and anything that fetches and runs code.
- Readability: obfuscated code, or minified code with no source in the artifact or the
  declared repository at the pinned commit, is rejected. A bundle is acceptable when the
  repository holds its source at that commit.
- Source match: when the declared repository holds the source at the pinned commit, the
  artifact's code matches it. Extra files, changed logic, or a dependency the source does
  not declare is a mismatch, and a mismatch is rejected.
- Scope: a pull request changes one record and its overview. Anything touching `.github/`,
  `scripts/`, `categories.json`, this file, or more than one record is a maintainer change
  and is never merged by the bot.
- Imports: a maintainer-approved import of listings from paseo.cafe is a pull request
  labeled `approved-import`, which lets validation accept new records carrying a registry
  overview. The label changes nothing else; a changed pin in such a pull request is held
  to the same rules.

## Bumps

A bump is reviewed as a diff between the two artifacts, extracted and compared by the
reviewer, not from the pull request body. The content checks above apply to what changed.
A bump that adds a lifecycle script, a dependency, a host, or a credential read is held to
the same justification as a new submission. When the diff changes what the plugin does,
the overview is updated in the same pull request.

## Overview

Every listing carries a curated overview at `plugins/<owner>/<slug>.md`, shown on the
plugin's page instead of its README. The reviewer writes it on submission and revises it on
a bump that changes behavior. Submitters may propose edits by pull request.

Shape, in sentence case, plain declarative sentences, 80 to 250 words:

1. What the plugin does, in the first paragraph. The thing a user gets.
2. Requirements: daemon version, OS, providers, accounts, other plugins, external tools.
3. Considerations: permissions it asks for, what it reads or sends and where, known limits.

Not in an overview: installation instructions (the page shows the install command), badges,
changelogs, contributing sections, marketing language, or anything the source does not
state. The overview is derived from the manifest, the README, and the code as reviewed.

## Outcomes

Every pull request ends in exactly one of these, with one review on the pull request
recording what decided it.

- **Merge.** Pin holds, every content check is justified, overview present. Squash merge
  against the reviewed commit.
- **Changes requested.** Something the submitter can fix: a moved tag, a missing manifest,
  a category that does not fit, an unjustified dependency they can drop, a README claim the
  code does not support. The review names the exact change. The submitter is told on the
  submission issue as well, because workflow-opened pull requests have no human author to
  notify. Fourteen quiet days close the pull request; a new commit or comment reopens it.
- **Closed.** Malicious or deceptive: hidden execution, exfiltration, credential theft, a
  tarball that does not match its source, obfuscation with no source. The review names the
  file and line. The submission issue is closed with the same text. On a bump, the listed
  version may share the problem: an issue titled `Delist <id>?` is opened with the evidence,
  labeled `needs-maintainer`, and the maintainer decides. Nothing is delisted automatically.
- **needs-maintainer.** This policy does not settle it, or the change is a maintainer
  change. The review opens with the questions the maintainer has to answer, each one a
  yes/no or A/B with the reviewer's pick, then the data points below.

A review always records: the artifact and version, the integrity result, what was
extracted and inspected, lifecycle scripts, dependencies, hosts, credential and environment
reads, the source match result, the decision, and the reviewed commit.
