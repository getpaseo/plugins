Adds composer pills to agents that stopped before finishing, so you can pick the work back up. It requires Paseo 0.7.2 or newer.

Detection is heuristic. A pill appears on an idle or errored agent when its last turn hit a provider usage limit (including a turn that ended with no output at all) or stopped mid-work without saying why. Agents waiting on a permission request get no pill, and neither does a turn whose last tool call was cancelled, which reads as a deliberate interruption. After a quota stop you can continue the same agent, schedule it to continue shortly after the limit renews, or hand the work to a new agent on another provider or model. A turn that stopped mid-work gets a single Continue pill.

The plugin reads agent timelines, and the tails of provider transcripts on disk, on the daemon to detect these stops. It takes no continuation, scheduling, or handover action unless you press a pill. A handover starts a new agent in the same workspace with a prompt you can edit, which points it at the source agent's history through the `paseo inspect` and `paseo logs` commands. It does not receive a full copy of the conversation. Scheduling runs `paseo heartbeat create` on the daemon host.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/chat-resume).*
