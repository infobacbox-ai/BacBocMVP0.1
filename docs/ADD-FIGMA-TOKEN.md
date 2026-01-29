# How to Add Your Figma Token

## Step 1: Get Your Figma Access Token

1. Go to [Figma Settings](https://www.figma.com/settings)
2. Click on **Account** tab (left sidebar)
3. Scroll down to **Personal Access Tokens** section
4. Click **Create a new personal access token**
5. Give it a name (e.g., "Cursor MCP")
6. **Copy the token** (you won't see it again!)

## Step 2: Edit Your MCP Configuration

Open this file in any text editor:

**Windows Path:** `C:\Users\<YourUsername>\.cursor\mcp.json`

Or use this PowerShell command to open it:
```powershell
notepad $env:USERPROFILE\.cursor\mcp.json
```

## Step 3: Add the Token

Find the `TalkToFigma` section and add the `env` property with your token:

**Before:**
```json
{
  "mcpServers": {
    "GitKraken": {
      ...
    },
    "TalkToFigma": {
      "command": "bunx",
      "args": ["cursor-talk-to-figma-mcp@latest"]
    }
  }
}
```

**After (add the `env` section):**
```json
{
  "mcpServers": {
    "GitKraken": {
      ...
    },
    "TalkToFigma": {
      "command": "bunx",
      "args": ["cursor-talk-to-figma-mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-actual-token-here"
      }
    }
  }
}
```

**Important:** Replace `"your-actual-token-here"` with the token you copied from Figma.

## Step 4: Save and Restart

1. **Save** the `mcp.json` file
2. **Close Cursor completely** (not just the window - quit the application)
3. **Reopen Cursor**
4. The MCP server will automatically connect when Cursor starts

## Verification

After restarting, you can test if it's working by asking Cursor:

```
"Can you read my Figma designs?"
```

Or:

```
"What does the StartScreen look like in Figma?"
```

If you see an error about the token, double-check:
- Token is correct (no extra spaces)
- JSON syntax is valid (commas, quotes)
- File was saved before restarting

## Security Note

⚠️ **Never commit your Figma token to git!** The `mcp.json` file is in your user directory (not the workspace), so it won't be committed, but be careful if you copy/paste configs.
