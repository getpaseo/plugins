Shows LiteLLM proxy spending and budget balances for OpenCode providers in Paseo’s Usage panel. A positive budget limit adds a utilization window and, when supplied by the proxy, its reset date. Accounts without a positive limit still show spending, with no remaining balance or utilization window.

## Setup

Requires Paseo 0.9.2 or later and an OpenCode provider login containing an API key. Provider base URLs come from `provider.<id>.options.baseURL` in `~/.config/opencode/opencode.jsonc`.

For a provider whose URL comes from an auth plugin or another source, add an override in `~/.config/litellm-usage/config.json`:

```json
{
  "providers": {
    "my-provider": {
      "name": "My LiteLLM",
      "baseUrl": "https://litellm.example.com"
    }
  }
}
```

Use the same provider ID as OpenCode. `name` is optional; a string containing the base URL is also accepted as the provider value. These entries override OpenCode’s URL and label. A trailing `/v1` is removed before requests.

## Data access and limitations

When Paseo discovers usage accounts, the plugin reads OpenCode’s `auth.json` from `~/.local/share/opencode/` and sends each configured provider’s API key as a Bearer token to that provider’s configured base URL at `/user/info`. Refreshes read the key again and request the same endpoint. XDG configuration/data directories and `HOME` are respected on the daemon host. Choose override URLs with care, since they receive the matching provider’s key.

Providers without an API key, unsuccessful discovery requests, and responses that do not contain LiteLLM’s expected spending and budget fields are omitted. Requests time out after 15 seconds. This source supplies global usage accounts; it does not discover accounts from an individual agent’s session environment. Balances are displayed in USD.

The plugin reads configuration and credentials without modifying them. Its inspected implementation does not send conversation content, run commands, or download additional software.
