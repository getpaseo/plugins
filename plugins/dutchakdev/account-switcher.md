Account Switcher lets you use several Claude and ChatGPT/Codex subscription accounts in Paseo. You pick an account for each agent, switch the account of an existing chat, set a default per provider, and see each account's usage limits. Switching is manual and within one provider. It does not rotate accounts automatically, switch a chat between Claude and Codex, or support API keys.

## How it works

- Each managed account has its own credential home. Settings and session history are shared with the provider's existing CLI setup, and a separate home is not a sandbox.
- **Enable** in Accounts replaces the Claude and Codex commands Paseo runs with the plugin's account launchers, which start the official CLI under the agent's account. **Disable** restores the original commands, so disable before removing the plugin.
- Switching reloads the agent through Paseo and keeps its session. It applies only when the agent is idle with no pending permission request.

## Setup

- Paseo 0.8, 0.9, 0.10 or 0.11, on a macOS or Linux daemon.
- Node.js 22.12 or newer.
- The official Claude Code, Codex and Paseo CLIs available to the daemon. Both provider CLIs must be installed even if you use only one.
- A Claude or ChatGPT subscription for each account. Adding an account runs the official CLI sign-in from Paseo.

## What it reads and sends

Switching accounts and monitoring limits both need the accounts' sign-in credentials.

- Reads each account's stored credentials: the Codex `auth.json` file, and Claude credentials from the profile's credential file or the macOS Keychain. It uses them to identify the signed-in account and, for Claude, to authenticate usage requests. Tokens stay in the provider's own storage and are not sent to the app.
- Claude limits come from a request to `api.anthropic.com` with the account's access token. Codex limits come from the official `codex app-server`. No model messages are sent.
- Deleting a managed Claude account also removes its Keychain item.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/account-switcher).*
