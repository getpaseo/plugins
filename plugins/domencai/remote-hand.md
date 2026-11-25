Remote hand lets you run an agent on another machine while it works on a project on this machine. The machine that holds the project is the **hand**. The machine that runs the agent is the **brain**. Any machine can take either role. Install the plugin on both machines. On the hand, start a session with the `remote-hand` provider and a brain model. The session runs on the brain with that brain's provider, and file reads, writes, searches and commands for the project run on the hand.

## Setup

- Install Paseo 0.16.1 or later on both machines and turn plugins on. The brain must be able to run the chosen provider in Paseo.
- On the brain, open **Connected devices** and create an invite. The pairing code is valid for five minutes and works once. Send it to the hand through a private channel.
- On the hand, open **Remote machines**, paste the code, review the risk notices and add the brain.
- The two machines connect through an end-to-end encrypted channel on a relay. The default relay is `relay.paseo.sh:443`. You can set your own relay with a valid TLS certificate. You do not need the Paseo daemon relay or daemon pairing.

## Controls on the brain

- **Connected devices** lists paired devices and their running sessions. You can revoke a device.
- You can limit which providers paired devices can use.
- **Let devices choose permission modes** is off by default. While it is off, a device can only use the brain's default mode for each provider. When it is on, a device can pick any mode the provider offers, including full access.
- **Max running sessions per device** limits how many sessions from one device can start or run at the same time. Idle sessions do not count.

## Controls on the hand

- Each brain starts at the **restricted** level. File tools can only reach projects you started sessions in, and shell commands are refused.
- The **full** level lets the brain's agent read and write any file and run shell commands with the hand user's permissions. Use it only for brains you trust.

## Data and access

- Prompts, agent output, and file contents and command output requested by the agent travel between the two machines over the encrypted channel.
- The agent on the brain keeps the brain's own native tools. It can read and change files on the brain as the brain's Paseo user, within the selected permission mode. A paired device can answer that agent's permission requests. Invite only devices you trust.
- On a shared brain, sessions from different devices are visible to each other in that brain's Paseo.
- The plugin connects to the local Paseo daemon with the daemon's local credential to create and manage agents. It stores device keys in its Paseo plugin data directory.

## Optional direct connections

Experimental EasyTier direct connections can replace the relay for traffic after pairing. You must turn them on in both machines and run your own rendezvous node. When you turn them on, the plugin shows a notice and downloads the EasyTier program from its GitHub releases or a mirror. It checks a pinned hash before it extracts and starts the program.

## Limitations

- The model can still use the brain's native tools instead of the hand tools, so some actions can happen on the brain.
- Windows hands are not yet tested on real hardware.
