# Viking (Life OS)

**What it is:** a personal AI assistant that unifies calendar management, web browsing/navigation, and reminders behind a single chat interface. Runs as a local command-line tool (`viking chat`) and also exposes an MCP server (`viking mcp-server`) so other AI tools can call the same capabilities.

**Why it exists:** to reduce the number of separate apps needed to manage a daily schedule and small recurring tasks, by putting calendar, reminders and light web actions behind one conversational layer instead of several disconnected tools.

**Tech stack:** Python 3.12, Google Calendar API, browser automation, Google Gemini API, Model Context Protocol (MCP) for the server interface. Structured as a single package with separate modules for calendar, browser, reminders, the assistant logic, and the MCP server.

**Status:** personal, ongoing project; evidence available as a local workspace rather than a hosted demo.

**Not included here:** Breno's own calendar data, credentials, or any personal content the assistant manages — only the tool's design and purpose. Ask Breno directly for a walkthrough.
