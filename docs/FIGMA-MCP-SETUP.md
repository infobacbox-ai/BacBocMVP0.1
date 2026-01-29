# Figma MCP Setup Guide

This guide will help you connect Cursor AI to your Figma designs using the Cursor Talk to Figma MCP server.

## Overview

The Cursor Talk to Figma MCP enables Cursor's AI agent to:
- Read your Figma designs directly
- Extract component specifications (spacing, colors, typography)
- Navigate prototype flows
- Query design states and screens
- Reference designs when implementing UI components

This is especially valuable for your project since **Figma Visual Truth** is one of your 6 canonical artifacts.

## Prerequisites

- Windows 10/11
- Cursor IDE installed
- Figma account with access to your design file
- PowerShell (for Bun installation)

## Step 1: Install Bun Runtime

Bun is required to run the MCP server. Install it using PowerShell:

```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

Verify installation:
```powershell
bun --version
```

## Step 2: Get Figma Access Token

1. Go to [Figma Settings](https://www.figma.com/settings)
2. Navigate to **Account** → **Personal Access Tokens**
3. Click **Create a new personal access token**
4. Give it a name (e.g., "Cursor MCP")
5. Copy the token (you'll need it in Step 4)

**Important:** Keep this token secure. Don't commit it to git.

## Step 3: Configure MCP Server in Cursor

Create or edit the MCP configuration file at:

**Windows:** `%USERPROFILE%\.cursor\mcp.json`

Or manually: `C:\Users\<YourUsername>\.cursor\mcp.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bunx",
      "args": ["cursor-talk-to-figma-mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-figma-token-here"
      }
    }
  }
}
```

**Replace `your-figma-token-here` with your actual Figma token from Step 2.**

## Step 4: Install Figma Plugin

1. Open Figma Desktop App or Figma Web
2. Go to **Plugins** → **Development** → **New Plugin**
3. Choose **"Link existing plugin"**
4. Install from Figma Community:
   - [Cursor Talk to Figma MCP Plugin](https://www.figma.com/community/plugin/1485687494525374295/cursor-talk-to-figma-mcp-plugin)
   - Or search for "Cursor Talk to Figma MCP"

## Step 5: Start WebSocket Relay (Development)

For local development, you'll need to run a WebSocket relay server:

```powershell
# Install the package globally (one-time)
bunx cursor-talk-to-figma-mcp@latest

# Start the WebSocket server
# Note: You may need to modify the socket.ts file for Windows
# Uncomment `hostname: "0.0.0.0"` if connection issues occur
```

## Step 6: Connect Plugin to Channel

1. Open your Figma file: **"Prototype V4 Bacbox App FREEZE MVP0 Final 23.01"**
2. Run the **"Cursor Talk to Figma MCP"** plugin
3. The plugin will connect to the WebSocket relay
4. You should see a connection confirmation

## Step 7: Restart Cursor

After configuring MCP, restart Cursor IDE to load the new MCP server configuration.

## Verification

Once set up, you can test the connection by asking Cursor:

```
"Can you read the Figma design for the error screen E429_QUOTA_REACHED?"
```

Or:

```
"What does the StartScreen look like in Figma?"
```

## Troubleshooting

### Bun not found
- Make sure Bun is installed and in your PATH
- Restart PowerShell/terminal after installation
- Verify with `bun --version`

### MCP server not connecting
- Check that `mcp.json` is in the correct location (`%USERPROFILE%\.cursor\`)
- Verify JSON syntax is valid
- Ensure Figma token is correct
- Restart Cursor after configuration changes

### WebSocket connection issues (Windows)
- The socket server may need `hostname: "0.0.0.0"` uncommented
- Check firewall settings
- Ensure port is not blocked

### Plugin not connecting
- Make sure WebSocket relay is running
- Check plugin is installed correctly
- Verify Figma file is open and accessible

## Usage Examples

Once connected, you can use natural language queries:

```
"What are the spacing values for the Header component?"
```

```
"Show me all the error states defined in Figma"
```

```
"What colors are used in the DashboardEmptyScreen?"
```

```
"Extract the microcopy for the Passer Premium button"
```

## Integration with Your Workflow

This setup integrates with your existing source of truth:

1. **Figma Visual Truth** (`5. Figma Visual Truth.md`) - Canonical design reference
2. **Contract Spec** - Error codes mapped to UI states
3. **Agent Rules** - UI implementation patterns

The MCP allows Cursor to query Figma directly when implementing UI components, ensuring designs match your Figma Visual Truth artifact.

## Security Notes

- Never commit your Figma access token to git
- Keep `mcp.json` in your user directory (not in workspace)
- Rotate tokens periodically
- Use environment variables for tokens in production setups

## References

- [Cursor Talk to Figma MCP GitHub](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [Figma API Documentation](https://www.figma.com/developers/api)
