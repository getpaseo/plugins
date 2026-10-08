# Review policy

The registry helps authors publish useful plugins and helps Paseo users install reviewed
artifacts. Reviewers complete the listing work they can do themselves and check the artifact
for malicious, deceptive, or seriously unsafe behavior. Ordinary submissions should move
through to approval once concrete requirements are met.

This file defines acceptance for human reviewers and the review bot. Read it from main.
The bot's operating prompt defines how it carries out the work. Editorial preferences and
hypothetical improvements are not additional acceptance requirements.

## The artifact is the product

Review exactly what the record installs, without executing it:

- npm: download the tarball at `artifact.resolved`, verify its SHA-512 against
  `artifact.integrity`, and confirm the version and integrity with npm.
- Git: inspect the tree at `artifact.commit` on `artifact.remote`, under
  `artifact.pluginPath` when present. Confirm the commit exists and a recorded tag
  still identifies it.

An npm package does not require a GitHub source repository, a reachable npm `gitHead`,
or a source-comparison result. Inspect the published package itself. Optional repository
material can help explain it; missing repository material and differences caused by
publishing are not independent blockers.

Never install, build, import, require, or run plugin code or its dependencies during review.
Fetching, extracting, reading and comparing artifacts, and viewing static listing images,
are allowed. Run trusted registry validation, not scripts supplied by a plugin or changes
to registry machinery supplied by a PR.

For bumps, independently extract and compare the old and new artifacts. Apply content checks
to the changes and the behavior those changes affect. Do not present existing behavior as
a newly introduced problem. Complete the necessary inspection before approving.

## Concrete acceptance requirements

The record must identify the intended plugin and install the exact reviewed artifact.
Check the pin, integrity, manifest, package metadata, plugin path and required entry files.
Use submission identity, package provenance where available, and registry ownership data
to check attribution and permission to submit. A repository source checkout is not required
to inspect an npm package.

Review install and build commands and every script they invoke. Dependency installation
must use a lockfile that fixes the dependency tree; inspect its resolved sources and
integrity information in the package manager's format. An installation that needs a
lockfile but does not include one is a concrete packaging blocker. Host-provided libraries
and development-only dependencies do not create an installation requirement. Read lifecycle
scripts that would execute; do not execute them yourself. Build commands must have an
understandable purpose and operate on the reviewed inputs.

Every published listing needs an accurate overview. Visual plugins need suitable media,
as described below. The reviewer can supply or correct these in the registry PR.

Run the registry validator against the completed proposal. A validator failure is evidence
to understand, not an instruction to pass its diagnostics to an author. Distinguish an
artifact defect, a registry edit you can complete, and a factory implementation that
conflicts with this policy. Record a factory conflict for correction without treating it
as an author obligation or silently bypassing publication checks.

## Security review

Judge access and execution against what the plugin does. Inspect:

- Dependencies and preparation scripts: their purpose, resolved origin, installation
  behavior, and unexplained or deceptive additions.
- Network requests: destinations, data sent, credential attachment, and what initiates them.
- Credentials and environment: secrets, configuration, keychain and other-plugin storage
  reads, their use, and where the data goes.
- Filesystem operations: what is read, written or deleted and the user's control over it.
- Execution: subprocesses, shell construction, eval, generated or remote code, and the
  path from external input to execution.
- Runtime software installation: what is downloaded or installed, from where, and the
  user's explicit confirmation. The overview must explain these actions.
- Readability: whether the artifact can be meaningfully inspected, including bundled
  code and any supporting source maps or source that is available.

Record concrete harmful behavior, such as credential theft, concealed data transmission,
code injection, unprompted remote execution, or destructive actions outside the plugin's
purpose. Explain the input or action that triggers it and the resulting effect. Intentional
subprocesses, service connections, configuration reads and media requests are assessed in
context. Their presence, or a preference for a different implementation, is not a finding
by itself. Do not require a fixed network allowlist as a general condition of listing.

Source unavailability does not establish malice. If code cannot be adequately inspected,
state the specific obstacle and what evidence is missing. Do not claim either a completed
security review or a confirmed exploit from a scan alone.

## Complete the listing

Use the submission, PR discussion, artifact, README, available documentation and assets to
understand the author's intent and finish the registry work. Reviewers may modify the
record, its listing metadata, and its registry overview on the submission or bump branch.
Use verified information, preserve the plugin's identity and behavior, and review any newly
selected artifact before approving it.

Make the edits you own rather than handing routine registry work back to the author.
Request author involvement only when necessary information or an artifact change is outside
your authority. Account for what the author has already supplied before asking for more.

A plugin review covers one record and its overview. Changes to registry scripts, workflows,
policy, categories or other registry infrastructure belong to repository maintenance and
are not merged through the plugin-review process.

## Images and media

Themes, workspace panels and other visual plugin interfaces need at least one image showing
that interface. Plugins without a visual interface do not need screenshots. Judge the
plugin's behavior, not its category label.

Use suitable assets already available in the author's material when completing a listing.
Decide whether they show the plugin clearly and are suitable for its page; routine image
selection and presentation judgments belong to the reviewer. Improving an already adequate
image is advice for a later release, not a reason to hold this one.

Registry media entries follow the metadata format: HTTPS image URLs with png, jpg, jpeg,
webp or gif extensions, or mp4/webm video URLs, case-insensitively. They must resolve with
the corresponding image or video content type. SVG is not accepted. The first image is
the card thumbnail. Apply registry `listing` overrides after manifest metadata.
These listing-format requirements do not impose a network policy on the plugin's runtime.

When no suitable image is available for a visual plugin, explain exactly what the author
must supply, where it belongs and in what format, linking to the
[publishing guide's media instructions](https://paseo.sh/docs/plugins/publishing#icons-and-screenshots).
Do not ask the maintainer to select or judge ordinary screenshots.

## Overview

The overview helps someone decide whether to install the plugin inside Paseo. Installation
is already provided by the listing page. Explain purpose, necessary setup, useful capabilities,
data access, permissions and meaningful limitations. Setup for accounts, tokens or external
tools belongs here; commands to install the plugin do not.

Prefer a useful author-written `OVERVIEW.md` shipped beside `paseo-plugin.json`.
When it is absent or needs editing, write or revise `plugins/<owner>/<slug>.md` in the
registry using the README and verified review findings. Do not copy the README wholesale,
invent behavior or require a new plugin release solely for this editorial work.

The registry copy is the reviewed listing override. Keep it accurate on bumps; remove it
when the artifact's own overview fully supplies the intended page. Existing import credits
describe the original import and are not added to newly reviewed plugins.

Length follows complexity. A theme may need one paragraph; a provider with setup and data
access may need more. Use plain factual language. Omit installation instructions, badges,
changelogs, contributing and license sections, marketing, and implementation detail that
does not help someone choose.

Tell the author when you wrote or edited the overview and recommend shipping a suitable
one in the next release. Explain that it is written for the listing page, where installation
is already shown. Link to the
[publishing guide's overview guidance](https://paseo.sh/docs/plugins/publishing#your-listing-page)
for its format. An imperfect supplied overview is editorial work, not an automatic rejection.

## Outcomes and communication

Approve and merge once the artifact review is complete, hard requirements are met and the
listing is ready. Approval is the expected outcome for useful, legitimate plugins. Complete
reasonable registry edits first; do not turn optional improvements into conditions.

Request changes only for a concrete blocker that genuinely needs the author. State why it
blocks publication and the exact action, data, location and format needed to resolve it.
Link the relevant publishing documentation. A list of technical findings is not a request
the author can act on.

Reserve `needs-maintainer` for credible malicious behavior, a serious safety concern, or a
decision about an already published unsafe version that exceeds the reviewer's authority.
State the evidence and the decision needed. Routine editorial judgments, incomplete work,
optional improvements and speculative concerns are not maintainer decisions. Never delist
an existing plugin automatically.

Clearly malicious or deceptive submissions may be closed with the evidence and a concise
explanation. For a serious unresolved safety concern, hold publication and ask the maintainer
the specific safety decision. Never describe uncertainty as proof of malicious intent.

Every completed review gets one concise author-facing outcome message on the PR, including
approvals. Say what happened, what registry edits were made, and what the author needs to do.
If nothing is required now, make that clear and separate any useful next-release advice
from requirements. For workflow-created PRs, notify the human submitter on the linked
submission issue with a short outcome and a link to the full PR review.

Put audit evidence in a collapsed `Review data` block: reviewed artifact and commit,
integrity, inspected scope, installation and dependencies, access and execution findings,
listing edits, and remaining uncertainty. Keep the author-facing part easy to scan.
When a maintainer decision is necessary, end with `For the maintainer:` and short questions.

The purpose of these rules is to get legitimate plugins published safely and reduce work
for authors and maintainers. The reviewer owns completion and ordinary judgment. Apply that
purpose when instructions overlap; escalate concrete serious risks, not the smallest doubt.
