Herald speaks one sentence aloud when an agent needs you, and lists everything waiting in a **Herald** sidebar panel. It announces questions, plan approvals, tool permission requests, finished turns and errors. Each announcement also appears as a card in that agent's conversation with a play icon to hear it again. Tapping a row in the panel opens that session.

## How it works

For each event, a short-lived helper agent writes the sentence using a model you choose (Claude Haiku 4.5 by default). The Paseo app speaks it. By default Herald deletes each helper session as soon as its sentence is written, and clears leftover helpers shortly after the daemon starts.

## Setup

- Paseo 0.9.0 or newer on the daemon and the device running the app.
- The `paseo` command on the daemon's `PATH`. Herald uses it only to delete helper sessions, and without it they accumulate.
- Speech plays on the device running the app. The desktop app speaks on its own, and a browser tab speaks after you press **Test voice** once. Phones cannot speak from a plugin, but Herald can vibrate. By default the voice comes from the daemon Mac's `say` command, and on a non-Mac daemon the browser voice is used.

## Settings

Open them from the gear in the panel header or from the Command Center.

- **Speech:** a master switch, per-device switches, voice source, voice, speed, and a test button. **Mute here** silences only the current device until the app restarts.
- **Summaries:** the model, an editable prompt with placeholders such as `{{agent}}`, `{{workspace}}`, `{{event}}`, `{{headline}}`, `{{detail}}`, `{{request}}` and `{{output}}`, whether helper sessions are deleted, and which event kinds are announced. Event kinds that are switched off still appear in the panel, without a summary or speech.
- **Agents started by another agent:** off by default, so you hear the parent agent's announcement rather than both.

## What it sends and reads

With the default prompt, the helper receives your last message and what the agent said after it (for a finished turn), or the question and choices or the command (for a question or permission request). That text goes to the model provider you selected, through your own provider credentials. Herald reads `PASEO_HOME` to locate its storage, and `PATH` and `PASEO_CLI` to find the `paseo` command for cleanup.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/herald).*
