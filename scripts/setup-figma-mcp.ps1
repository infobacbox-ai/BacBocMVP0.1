# Figma MCP Setup Script for Windows
# This script helps set up the Cursor Talk to Figma MCP integration

Write-Host "=== Figma MCP Setup for Cursor ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Bun installation
Write-Host "Step 1: Checking Bun installation..." -ForegroundColor Yellow
try {
    $bunVersion = bun --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Bun is installed: $bunVersion" -ForegroundColor Green
    } else {
        throw "Bun not found"
    }
} catch {
    Write-Host "✗ Bun is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Bun..." -ForegroundColor Yellow
    powershell -c "irm bun.sh/install.ps1|iex"
    
    # Verify installation
    $bunVersion = bun --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Bun installed successfully: $bunVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Bun installation failed. Please install manually:" -ForegroundColor Red
        Write-Host "  powershell -c `"irm bun.sh/install.ps1|iex`"" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Step 2: Check/create .cursor directory
Write-Host "Step 2: Checking Cursor config directory..." -ForegroundColor Yellow
$cursorDir = "$env:USERPROFILE\.cursor"
if (-not (Test-Path $cursorDir)) {
    New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null
    Write-Host "✓ Created .cursor directory" -ForegroundColor Green
} else {
    Write-Host "✓ .cursor directory exists" -ForegroundColor Green
}

Write-Host ""

# Step 3: Check existing mcp.json
Write-Host "Step 3: Checking MCP configuration..." -ForegroundColor Yellow
$mcpPath = "$cursorDir\mcp.json"

if (Test-Path $mcpPath) {
    Write-Host "⚠ mcp.json already exists" -ForegroundColor Yellow
    Write-Host "Current contents:" -ForegroundColor Gray
    Get-Content $mcpPath | Write-Host
    Write-Host ""
    $overwrite = Read-Host "Do you want to add TalkToFigma to existing config? (y/n)"
    
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        # Read existing config
        $existingConfig = Get-Content $mcpPath | ConvertFrom-Json
        
        # Add TalkToFigma if not exists
        if (-not $existingConfig.mcpServers.TalkToFigma) {
            $existingConfig.mcpServers | Add-Member -MemberType NoteProperty -Name "TalkToFigma" -Value @{
                command = "bunx"
                args = @("cursor-talk-to-figma-mcp@latest")
            }
            
            $existingConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpPath
            Write-Host "✓ Added TalkToFigma to existing MCP config" -ForegroundColor Green
        } else {
            Write-Host "⚠ TalkToFigma already exists in config" -ForegroundColor Yellow
        }
    }
} else {
    # Create new mcp.json
    Write-Host "Creating new mcp.json..." -ForegroundColor Yellow
    
    $mcpConfig = @{
        mcpServers = @{
            TalkToFigma = @{
                command = "bunx"
                args = @("cursor-talk-to-figma-mcp@latest")
            }
        }
    }
    
    $mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpPath
    Write-Host "✓ Created mcp.json" -ForegroundColor Green
}

Write-Host ""

# Step 4: Prompt for Figma token
Write-Host "Step 4: Figma Access Token" -ForegroundColor Yellow
Write-Host "You need to add your Figma access token to the MCP config." -ForegroundColor Gray
Write-Host ""
Write-Host "To get your token:" -ForegroundColor Cyan
Write-Host "  1. Go to https://www.figma.com/settings" -ForegroundColor White
Write-Host "  2. Navigate to Account → Personal Access Tokens" -ForegroundColor White
Write-Host "  3. Create a new token" -ForegroundColor White
Write-Host ""
$addToken = Read-Host "Do you want to add your Figma token now? (y/n)"

if ($addToken -eq "y" -or $addToken -eq "Y") {
    $token = Read-Host "Enter your Figma access token" -AsSecureString
    $tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))
    
    # Update mcp.json with token
    $config = Get-Content $mcpPath | ConvertFrom-Json
    if (-not $config.mcpServers.TalkToFigma.env) {
        $config.mcpServers.TalkToFigma | Add-Member -MemberType NoteProperty -Name "env" -Value @{}
    }
    $config.mcpServers.TalkToFigma.env.FIGMA_ACCESS_TOKEN = $tokenPlain
    
    $config | ConvertTo-Json -Depth 10 | Set-Content $mcpPath
    Write-Host "✓ Token added to MCP config" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠ You'll need to manually add the token to mcp.json:" -ForegroundColor Yellow
    Write-Host "  Add `"env`": { `"FIGMA_ACCESS_TOKEN`": `"your-token-here`" }" -ForegroundColor Gray
    Write-Host "  to the TalkToFigma configuration" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Install Figma plugin: https://www.figma.com/community/plugin/1485687494525374295/cursor-talk-to-figma-mcp-plugin" -ForegroundColor White
Write-Host "  2. Restart Cursor IDE" -ForegroundColor White
Write-Host "  3. Open your Figma file and run the plugin" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see: docs/FIGMA-MCP-SETUP.md" -ForegroundColor Cyan
