Adds a **Hosts** page, workspace tab and status dot to Paseo for seeing what is slowing a computer down, stopping runaway jobs, and reaching dev servers running on a host. Requires Paseo 0.9.0 or later.

It lists the heaviest processes, judged against the container's own memory limit. You choose which to stop, see what will stop (children included) before confirming, and every stop is logged. Paseo, its plugins, agents, terminals and databases are never stopped. Health checks run in the background by default and only flag problems, and nothing is stopped automatically.

Each dev server can be reached three ways:

- **Browser link.** A temporary public `trycloudflare.com` address protected by a session cookie, for opening the app from any browser. It needs `cloudflared` on the host. When you press **Set up browser links**, the plugin downloads `cloudflared` from the Cloudflare releases on GitHub (macOS and Linux, x64 and arm64) and runs it. Nothing is downloaded until you do.
- **Paired hosts.** Two Paseo hosts that both run this plugin give each other a private localhost link through the Paseo relay (`wss://relay.paseo.sh` by default, end to end encrypted). Pairing grants no agent, file, process or daemon control and can be revoked from the hosting side.
- **SSH forward.** Saved presets that use the host's own `ssh`.

You can also watch health URLs on other machines and send Git projects between paired hosts. Each transfer needs a separate sharing permission, shows a commit preview first, and is checked out in isolation. Nothing syncs automatically.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/daemon-link).*
