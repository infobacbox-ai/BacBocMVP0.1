# Quick Start: Figma MCP Setup

## Automated Setup (Recommended)

Run the PowerShell setup script:

```powershell
.\scripts\setup-figma-mcp.ps1
```

This script will:
- ✅ Check/install Bun runtime
- ✅ Create/update MCP configuration
- ✅ Guide you through adding your Figma token
- ✅ Provide next steps

## Manual Setup

If you prefer manual setup, see the detailed guide: **[docs/FIGMA-MCP-SETUP.md](docs/FIGMA-MCP-SETUP.md)**

## What This Enables

Once configured, Cursor AI can:
- Read your Figma designs directly
- Query component specifications (spacing, colors, typography)
- Extract microcopy and UI text
- Navigate prototype flows
- Reference designs when implementing components

## Your Figma File

**File Name:** "Prototype V4 Bacbox App FREEZE MVP0 Final 23.01"

This is your **Figma Visual Truth** (Artifact 5) - one of the 6 canonical source of truth documents.

## Quick Test

After setup, restart Cursor and try:

```
"What does the error screen for E429_QUOTA_REACHED look like in Figma?"
```

Or:

```
"Show me the StartScreen design from Figma"
```

## Troubleshooting

See **[docs/FIGMA-MCP-SETUP.md](docs/FIGMA-MCP-SETUP.md)** for detailed troubleshooting steps.
