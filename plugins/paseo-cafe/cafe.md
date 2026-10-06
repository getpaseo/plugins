Paseo Cafe adds a Paseo Cafe sidebar surface for browsing the paseo.cafe plugin catalog and managing plugins from inside Paseo. Each listing shows the package version, description, categories, platforms, required Paseo version, caveats, health checks, and screenshots. Search and filtering run in the client. A composer attachment source called Paseo plugin attaches a plugin's full listing to a prompt, so an agent can review it before you install.

## Requirements and setup

The manifest accepts Paseo 0.8.0 up to but not including 0.12.0, with 0.11 prereleases accepted from 0.11.0-beta.1. The `paseo` command must be on the daemon host's `PATH`, because plugin management and the installed-plugin list go through the Paseo CLI. No account or key is needed.

## Network access

- The daemon downloads the catalog as JSON from `https://paseo.cafe/api/plugins`. The request has a 10-second timeout, refuses redirects, and rejects responses over 16 MiB. Results are cached for five minutes, and Refresh skips the cache.
- To use another catalog, set Catalog URL in the plugin's settings page. The `PASEO_CAFE_DIRECTORY_URL` environment variable on the daemon is used only when no setting is saved. Both must be HTTPS, or HTTP on localhost or a loopback address, and an invalid environment value is ignored.
- The catalog decides which npm package and version, or Git repository and commit, the install button hands to the Paseo CLI. A catalog you point it at controls what gets installed, so use only a catalog you trust.
- The client loads listing screenshots from the URLs the catalog supplies.

## Plugin management

The plugin invokes the Paseo CLI on the daemon host to install and update plugins. Installing happens after a confirmation step that shows the source and caveats. Plugins from this catalog are community-submitted, unsandboxed code that runs on the host.

Updates use the exact version (npm) or commit (Git) from the catalog and never downgrade. When a package has a separate `next` release, the detail page offers it as an opt-in Preview. Preview users keep following that channel until they switch back to stable.

Automatic updates are on by default for plugins installed through reviewed npm packages. Cafe checks 30 seconds after startup and every six hours, follows each plugin's Stable or Preview choice, and keeps one plugin's failure from blocking others. Turn them off per plugin on its detail page. Cafe updates itself the same way, using a detached process so the update survives the restart. Check now in the plugin's settings runs the check immediately.

Plugins installed from Git under Paseo 0.8 stay pinned to their installed commit until reinstalled. On Paseo 0.8, attachment searches ignore a custom Catalog URL and use the default catalog.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-cafe).*
