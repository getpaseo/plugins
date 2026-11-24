OpenCode Copilot usage shows used and remaining GitHub Copilot premium requests and the monthly reset date in Paseo's Usage panel.

Sign in to GitHub Copilot through OpenCode on the machine running the Paseo daemon. The plugin reads the Copilot OAuth login from OpenCode's local `auth.json` and uses it to authenticate requests to GitHub's Copilot usage endpoint. If GitHub rejects the login, refresh it in OpenCode. GitHub does not document this endpoint, so changes to it can interrupt quota reporting.
