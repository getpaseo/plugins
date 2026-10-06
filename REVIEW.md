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

## Submissions

The issue title names the plugin. The form collects its Source and Categories;
the bot derives the listing id and pins the latest npm version or newest Git tag.
A GitHub folder URL or install source can locate a plugin inside a repository.
The `submission` label identifies these issues; the title has no required prefix.

## Pin

The record is only valid when the pin holds:

- The version is exact and the integrity matches npm. A pin that npm no longer serves, or
  serves with a different integrity, is rejected.
- A git commit is a full 40-character hash reachable on the remote. A tag that has moved
  away from the pinned commit is rejected until the pin is updated. A maintainer can pin
  a repository with no release tag to a commit alone; automatic bumps start when it
  publishes a tag.
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

- Install-time commands: the manifest's `install` and `build` commands and the package's
  `preinstall`, `install`, `postinstall`, and `prepare` scripts. This is where most
  vulnerabilities live, so every command and every script file it invokes is read in full
  at the pinned commit, and the review says what each one does. Dependencies are
  installed with `npm ci --ignore-scripts`; `npm install`, or `npm ci` without
  `--ignore-scripts`, is changes requested unless every dependency lifecycle script that
  would run has been read and is named in the review. The lockfile at the pinned commit
  carries `resolved` pointing at the public npm registry and `integrity` for every entry;
  a missing lockfile or an entry without either is changes requested, and an entry
  resolved to a git URL or a tarball elsewhere is reviewed as a dependency. A command that
  downloads anything and runs it, pulls a branch or tag, or installs a package the lockfile
  does not fix bypasses the pin and is rejected. A build script only transforms files
  already in the artifact.
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
- Runtime installs: a plugin that clones, downloads, installs, or updates software while
  running is listed when the action runs only on the user's explicit confirmation and the
  overview names what it installs and from where. One that does it unprompted is
  rejected.
- Readability: obfuscated code, or minified code with no source in the artifact or the
  declared repository at the pinned commit, is rejected. A bundle is acceptable when the
  repository holds its source at that commit.
- Source match: when the declared repository holds the source at the pinned commit, the
  artifact's code matches it. Extra files, changed logic, or a dependency the source does
  not declare is a mismatch, and a mismatch is rejected.
- Listing media: entries are HTTPS image (`png`, `jpg`, `jpeg`, `webp`, `gif`) or video (`mp4`,
  `webm`) URLs, with case-insensitive extensions. Each URL returns HTTP 200 and an
  `image/*` or `video/*` content type. SVG is not accepted. The card thumbnail is the
  first image in media order.
- Visible surfaces: every theme and any plugin that adds a panel or other UI lists at
  least one image of that surface. A theme without an image is not listed.
- Scope: a pull request changes one record and its overview. Anything touching `.github/`, `featured.json`,
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

Every listing's page shows an overview instead of the README. A README assumes its reader
is on GitHub: it carries installation steps, technical detail, badges, and grows long. The
overview is read inside Paseo, where the install command already sits at the top of the
page, by someone deciding whether to install.

`OVERVIEW.md` next to `paseo-plugin.json` is required. A submission or a bump whose
repository has no `OVERVIEW.md` at the pinned commit fails validation and gets changes
requested naming the file. Records imported from paseo.cafe are the exception: they carry
one written at import at `plugins/<owner>/<slug>.md`, ending with the line
`*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/<slug>).*`.
The author may replace that file by pull request, and the author's own `OVERVIEW.md` takes
over on the first bump, which removes the registry copy.

What it contains, in this order:

1. What it is and what it does, in plain terms. One or two short paragraphs.
2. How it works, only when that is not obvious from the first paragraph.
3. Setup, when any is required: settings to fill in, accounts or tokens to connect,
   providers or tools that must be present, other plugins it depends on. Setup is allowed;
   installation is not.
4. Capabilities or settings worth explaining: what each option does, what the plugin reads
   or sends and where, the permissions it asks for, known limits.

Length follows the plugin's complexity: a theme is a paragraph, a provider plugin with
settings can be longer. The test is that nothing in it is noise to someone choosing. Never
installation commands, badges, changelogs, contributing or license sections, marketing
language, or claims the source does not support.

The reviewer checks `OVERVIEW.md` against this shape on submission and on a bump, and
requests changes when it is a README in disguise. A pull request that changes a
registry-carried overview merges when it comes from the plugin's repository owner or the
record's submitter and fits the shape; from anyone else it waits for the maintainer.

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
