ArgoCD deployment status adds a pill to an agent's composer when the agent is deploying or watching an ArgoCD application. The pill shows the app name, a state mark and both ArgoCD axes, for example `paseo ✓ Synced·Healthy`, `paseo ◐ Synced·Progressing` while it syncs or rolls out, `paseo ✗ Synced·Degraded` for a degraded app or failed operation, and `paseo ?` when the state can't be read. The mark is tinted by the state. Tapping the pill shows the running operation with its message and duration, the revision, the resources that are not in sync or healthy, and a link to the ArgoCD UI when you have set one.

The app is the last one the agent itself names in its messages or shell commands, such as `argocd app sync paseo`, `kubectl get application paseo -n argocd` or an ArgoCD UI link. Tool output, reasoning and repository names alone never link an app, and the app must exist in the cluster.

Setup:

- The Paseo daemon's host needs `kubectl` and a kubeconfig (`KUBECONFIG`, or `~/.kube/config`) that can read ArgoCD `Application` resources. They are expected in the `argocd` namespace.
- For the UI link, set `ARGOCD_UI` to your ArgoCD base URL on the daemon host, or put it on the first line of `~/.config/paseo-argocd/ui`. Without it the popover shows no link.

What it reads and runs:

- The daemon runs read-only `kubectl get application <name> -n argocd -o json` and `kubectl get applications -n argocd -o json`. Each app is read at most once every 15 seconds however many clients are open, and the pill polls every 10 seconds while a deployment moves and every 2 minutes once settled. The app name is checked against a strict pattern before it reaches `kubectl`, and the command runs without a shell.
- To find the app, the daemon reads each agent's most recent 200 timeline entries (your and the agent's messages, and shell commands) and keeps only the app name. No cluster credential or transcript text is sent to the client.
- The plugin makes no network requests of its own beyond what `kubectl` does with your kubeconfig. The popover text is in Spanish.
