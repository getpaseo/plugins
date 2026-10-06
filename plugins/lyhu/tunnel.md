HTTP Tunnel lets an HTTP or HTTPS service reachable from one Paseo host be used from another Paseo host you manage, through the Paseo Relay. It forwards HTTP only, including streaming and server-sent events, and does not support TCP, UDP, `CONNECT` or WebSocket upgrade. It requires Paseo 0.8.0 or newer on both hosts.

**Setup.** On the host that can reach the service, you add an Ingress for that origin and copy its Route Offer. On the other host, you add an Egress and paste the offer. The offer contains the relay address, the host's public key and a route secret, so anyone holding it can open that route. Rotating the Ingress secret invalidates every offer already shared.

**Network.** Ingress connects to the Paseo Relay at `relay.paseo.sh:443` over TLS by default (a self-hosted relay can be set in the config file), and Egress connects to the relay address in the offer it imported. Traffic is encrypted between Egress and Ingress, and the relay carries encrypted frames. Tunnels keep running in the background while the Paseo app is closed, as long as the daemon runs.

**Access.** Egress listens on plaintext HTTP, on `127.0.0.1` by default or on all interfaces if you choose. It is unprotected by default, so anyone who can reach the port can use the service. You can instead require a token, either in a dedicated header or as a Bearer token. For internet exposure, put a TLS reverse proxy in front.

The host's private key and route secrets are stored in `tunnel/config.json` under the Paseo home, with owner-only permissions.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/http-tunnel).*
