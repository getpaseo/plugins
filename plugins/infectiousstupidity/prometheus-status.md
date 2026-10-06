Prometheus Status shows GPU utilization, temperature, VRAM and power from a Prometheus server. A GPU pill appears above the composer only when temperature needs attention, and a status panel lists every GPU.

The pill is hidden below 75°C, shows in the warning color from 75°C to 84°C while utilization is above 0%, and always shows in the danger color at 85°C or hotter, even at 0% utilization. Press it to open the panel, which shows utilization, temperature, VRAM and power per GPU and refreshes every 10 seconds. The panel also opens from the workspace or Explorer launcher and from **Open GPU status** in the Command Center. The 75°C and 85°C thresholds are fixed in the plugin.

## Setup

You need a Prometheus server that the daemon machine can reach and that scrapes NVIDIA DCGM Exporter metrics (`DCGM_FI_DEV_GPU_UTIL`, `DCGM_FI_DEV_GPU_TEMP`, `DCGM_FI_DEV_FB_USED`, `DCGM_FI_DEV_FB_FREE`, `DCGM_FI_DEV_FB_RESERVED`, `DCGM_FI_DEV_POWER_USAGE`). Open **Settings, Plugins, GPU status** and fill in:

- **Prometheus URL**, an `http://` or `https://` address, which is required.
- **Metric selector**, inserted inside the label braces of the built-in queries, for example to pick one job or instance.
- **Host label**, and whether it appears in the composer pill.
- Optional custom queries for utilization, sample timestamp, temperature, VRAM used, VRAM total and power.

Saving applies immediately.

## Data and files

- The plugin runs in the daemon and sends read-only instant queries to `<Prometheus URL>/api/v1/query`, with a 4 second timeout and a 10 second cache. It queries the configured Prometheus URL and does not connect to GPU hosts itself. The HTTP request follows redirects.
- Settings are stored in `paseo-prometheus-status.json` in the Paseo home directory, written with owner-only permissions. The plugin creates that file with empty defaults when it loads, which is outside its own plugin data folder.
- `PASEO_PROMETHEUS_*` environment variables on the daemon (the URL, selector, host label, pill label flag and each custom query) override the saved values. The settings screen lists which overrides are active.
- A GPU is listed only when its utilization sample has a timestamp. If temperature, VRAM or power queries fail, those values are blank and the panel says which failed.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-prometheus-status).*
