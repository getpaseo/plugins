Review Deck is a review workspace for the changes an agent made in a Paseo workspace. You browse the Git diff by file and hunk, comment on exact lines, and send the collected comments back to an agent in that workspace. It requires Paseo 0.10.0 or later.

Submitting comments messages an existing agent in the workspace, and a workspace with no eligible agent keeps its comments queued without creating one. The agent reports an outcome for each comment, so check the resulting diff yourself. The plugin's own diff-editing action is rejecting a hunk or reverting a file, which applies a reverse patch to the working tree or index and is refused if the workspace no longer matches the snapshot you reviewed. It can also run a verification command suggested by an AI finding in a workspace terminal, but only after you confirm the exact command.

AI review (explaining a hunk, reviewing a file or reviewing the whole change) starts a separate child agent in the same working directory with the diff in its prompt, so the diff goes to the provider and model you choose for reviews. The reviewer is constrained to a read-only or approval-gated mode, and the review is refused if the provider offers neither.

Settings cover the interface language, diff layout and the reviewer provider, model and thinking level. Review Deck runs Git in the workspace to read diffs and stores comments, batches, review metadata and an AI result cache as JSON under `.paseo/review-deck/` in your user home directory.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/review-deck).*
