S/ash lets you define your own slash commands for the Paseo composer and manage them in a "S/ash console" sidebar screen. It requires Paseo 0.8.0 or later.

## What it does

Each command has a name, a title, a description and one of three actions:

| Action | What happens when you run it |
| --- | --- |
| **send** | Fills a prompt template and sends it to the current agent. `{args}` in the template is replaced with whatever you typed after the command, and if the template has no `{args}` the text is appended. |
| **open** | Opens a plugin screen by name. |
| **rpc** | Runs a named operation from the plugin's operation list, on the daemon host. |

The console lists enabled commands and lets you add, edit and remove them. It also lists the built-in commands separately so you can add back one you removed, and it can export enabled commands to a `slash-commands` bundle and import a bundle on another machine, with an option to overwrite commands that have the same name.

The built-in commands are `review` (sends "Review the current changes: {args}"), `console` (opens the S/ash console), `ping` (a no-op operation that returns the plugin version) and `orchestrate` (see below).

## Settings

- **Prefix**: added to every command name. The default is `slash-`, so `review` appears as `/slash-review`. It accepts lowercase letters, digits and dashes, and can be empty to show bare command names.
- **Command names** must start with a letter or digit and use lowercase letters, digits and dashes.
- **Operation bindings**: extra operations that rpc commands can call, layered over the built-in ones, where a binding with a built-in's name replaces it. A binding is either a built-in handler (`slash.ping`, `slash.echo`, `slash.orchestrate`) or an HTTP request declared as data: a method (`GET` or `POST`), a path, optional static headers, and the names of call-time parameters allowed into a `POST` body. Only operations in this list can be run.
- **Hook URL** and **hook secret file**: the endpoint and bearer-secret file used by `orchestrate` and by HTTP bindings marked `auth: true`.

## What it sends

The `send` and `open` actions stay inside Paseo, and so do the `slash.ping` and `slash.echo` operations, which run locally. Only `orchestrate` and HTTP bindings make requests, from the daemon host:

- The target is the binding's `target`, then the **Hook URL** setting, then the `PASEO_FORGEJO_HOOK_URL` environment variable, then `http://127.0.0.1:8099`. Only `http` and `https` URLs are accepted.
- `orchestrate` posts the calling agent's id to `<target>/orchestrate`, and the receiving service is expected to hand the orchestrator role to that agent. It requires a bearer secret, and fails without sending if none is found or if the endpoint is unreachable or rejects the request.
- An HTTP binding with `auth: true` also sends that secret. The secret is read from the **hook secret file** setting, then the file named by `PASEO_FORGEJO_HOOK_SECRET_FILE`, then `.paseo/forgejo-hook.secret` in your user home directory (it does not follow `PASEO_HOME`), then the `FORGEJO_WEBHOOK_SECRET` environment variable. It is not stored in settings, and authorization headers are redacted in logs.
- Requests time out after 10 seconds. Responses to HTTP bindings are capped at 64 KB, and the `orchestrate` response is not capped.

Send these requests only to endpoints you trust with the secret, since a binding's target can point at any `http` or `https` address.

## Limits

The console suggests `slash-console`, `main`, `approvals` and `paseo-top-dashboard` as targets for `open` commands, a curated list that Paseo does not keep in sync. You can enter any other target, with a warning, and a target that no plugin or Paseo provides may not open anything. Only the S/ash console is part of this plugin.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/slash).*
