# MCP servers

The MCP servers I use, and how to add each one to Claude Code on your host.

The containers don't read this folder. They load [`config/claude/mcp.json`](../config/claude/mcp.json), which `compose/entrypoint.sh` passes to Claude as `--mcp-config`. Only servers that work inside a container go in that file.

| Server          | In `mcp.json` | Used for                                            |
| --------------- | ------------- | --------------------------------------------------- |
| Breeze          | Yes           | Hubexo's Breeze AI endpoint                         |
| Chrome DevTools | No            | Letting an agent drive a real browser on your host |

## Breeze

A remote HTTP server, so it works the same on the host and in a container:

```sh
claude mcp add --transport http breeze-mcp https://breezeai-mcp.hubexo-ai-global-breeze.com/mcp
```

## Chrome DevTools

The [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) lets an agent drive a real browser. It can click through the app, read the console and network requests, and take screenshots. I use it all the time to check frontend changes. You log in yourself, and the agent takes over from there.

On WSL it has to run on the Windows side. WSL can't reach a Windows Chrome debug port, and a headed Chromium inside WSL is unreliable. Run this from the project you want it in:

```sh
claude mcp add chrome-devtools -- cmd.exe /c npx -y -p node@22 -p chrome-devtools-mcp@latest \
  chrome-devtools-mcp --no-performance-crux --no-usage-statistics
```

`-p node@22` covers an older Windows Node, since the MCP needs Node 22. The two `--no-*` flags stop internal URLs from being sent to Google. On macOS or native Linux, drop the `cmd.exe /c` and the `node@22` package.

It isn't in `mcp.json` because the containers have neither `cmd.exe` nor a browser.
