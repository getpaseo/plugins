New sessions gives Claude agents the way Claude Desktop offers to split work into a separate session. When you ask an agent for a task that stands on its own, it shows a card in the chat with two buttons, "Nueva sesión" (New session) and "Hazlo aquí" (Do it here), and waits for your answer. Choosing New session makes the agent write a brief and opens a sibling agent in the same workspace with the same provider, mode and thinking level. You can pick a different model from the provider's list on the card. Choosing Do it here keeps the work in the current session. If you type a message instead of answering, the offer closes.

An agent can also propose a follow-up it noticed as a "Nueva tarea" card with an Empezar (Start) button, up to three per turn. Nothing runs until you click it or tell the agent to start it, and the agent can withdraw a proposal that went stale. A pill under the chat lists the offers and proposals still waiting. If you ask in words for separate or background work, the agent starts that session right away without a card.

The plugin also lets one session coordinate another that already exists in the same workspace. The coordinator links the other session with an objective, sends it follow-up prompts only while it is idle, and gets an event when its turn ends. This does not approve permission requests, restart, or archive the other session, and it pauses if you step in. The `ESPERA: sesion <id>` wait that coordination relies on has to be understood by your own closing-message setup, so installing the plugin alone does not provide it.

Setup and requirements:

- It works with Claude agents only, and needs Paseo 0.14.0 or later.
- Sessions that were already open pick up the new tools the next time they reload, which happens before their next message once the plugin is enabled.
- The card labels are in Spanish.

What it touches:

- It starts a small MCP server on `127.0.0.1` with a random bearer token and adds it to every new or resumed Claude session. The server's instructions are added to the session's system prompt. It makes no network requests beyond that local loopback.
- The port and token are saved in `$PASEO_HOME/rutador-mcp.json` (owner-only permissions). Offer outcomes and coordination records are saved in `rutador-tareas.json` and `rutador-coordinaciones.json` in the same folder.
- It approves permission prompts for its own `start_session` and `dismiss_task` tools automatically, because the card is the question. Other tools, including coordination, still ask as usual.
- Sessions it starts inherit the parent's permission mode, including bypass modes. Check the mode of the session you offer from.
