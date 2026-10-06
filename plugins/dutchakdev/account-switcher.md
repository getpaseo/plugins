Account Switcher lets you use several Claude and ChatGPT/Codex subscription accounts in Paseo. You choose an account for each agent, switch the account of an existing chat, set a default account per provider, and see the usage limits of every saved account. Open it from **Accounts** in the sidebar or **Accounts and limits** in the Command Center, and use the account chip beside the message field to switch within a chat.

## How it works

- Each provider has a **system** account that uses the CLI's existing sign-in, plus accounts the plugin manages. Each managed account has its own credential storage, and settings, skills, MCP configuration and session history are shared with the system account through links and copied configuration. A profile separates sign-in only and is not a sandbox.
- **Enable** in Accounts saves your original Claude and Codex commands and points Paseo at launchers the plugin installs. Each launcher starts the official CLI under the account assigned to the agent. **Disable** restores the original commands. Disable before disabling or removing the plugin.
- Switching: choose a verified account of the same provider from the chip, then **Apply**. Apply runs only when the agent is idle with no pending permission request, reloads the agent through `paseo agent reload`, and keeps the native session ID. If the switch fails, the plugin tries to restore the previous account, and an unconfirmed account is shown as unconfirmed. Avoid sending a message from another client during Apply, because the reload can interrupt it.
- Adding an account runs the official CLI sign-in in the background and opens a dialog in Paseo. Claude finishes on the provider's page, with an authorization code if one is shown (paste the whole code, including the part after `#`). Codex supports a device code, which works from a phone, or a browser sign-in that must happen on the daemon's computer. Enter passwords only on the provider's own page.

## Setup

- Paseo 0.8, 0.9, 0.10 or 0.11, a macOS or Linux daemon, Node.js 22.12 or newer, and the official Claude Code, Codex and Paseo CLIs available to the daemon. Both provider CLIs must be installed even if you use one.
- Claude or ChatGPT subscription sign-in. API keys and custom provider or endpoint overrides are not supported, and conflicting settings are rejected.

## Credentials and limits monitoring

Switching accounts and monitoring quota require access to sign-in credentials, and the plugin uses them for those two purposes only.

- Reads each account's stored sign-in: Codex `auth.json`, and Claude credentials from the profile's credential file or, on macOS, its Keychain item. Identity details (such as the account email and plan) are decoded from these to verify who is signed in. Access and refresh tokens stay in the provider's own storage and are not returned to the app or written to the plugin's cache.
- Deleting a managed Claude account removes its Keychain item with the macOS `security` tool.
- Limits are checked every 5 minutes, or every 60 seconds while Accounts or the switcher is open. Codex limits come from a short-lived official `codex app-server` process. Claude limits come from a GET request to `https://api.anthropic.com/api/oauth/usage` with the selected account's access token. No model message is sent. A Codex limits request may refresh that account's token through the CLI.
- Limits show used and remaining percentages and reset times, with color thresholds at 80%, 95% and 100% used. Missing data shows as no data, and data from a failed check is marked stale.
- Reads `PASEO_HOME`, `CLAUDE_CONFIG_DIR`, `CLAUDE_SECURESTORAGE_CONFIG_DIR` and `CODEX_HOME` to find provider homes.

## Stored data

Accounts, managed profile homes, generated launchers, sign-in receipts and the last limits cache live in an `account-switcher` directory under the Paseo data directory. Directories are created owner-only. Removing the plugin does not delete this directory. Archived agents keep their account binding for resume, and an account cannot be deleted while it is current, pending or the default for an agent.

## Limits

Switching is manual and within one provider. Automatic rotation and moving a chat between Claude and Codex are not supported. Provider sign-in and limit formats can change with CLI versions, and unsupported data shows as unavailable.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/account-switcher).*
