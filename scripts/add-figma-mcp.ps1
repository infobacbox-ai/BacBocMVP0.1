# Add Figma MCP to existing Cursor MCP configuration
# This script safely adds TalkToFigma without overwriting existing configs

$mcpPath = "$env:USERPROFILE\.cursor\mcp.json"

if (-not (Test-Path $mcpPath)) {
    Write-Host "mcp.json not found. Creating new file..." -ForegroundColor Yellow
    $cursorDir = "$env:USERPROFILE\.cursor"
    if (-not (Test-Path $cursorDir)) {
        New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null
    }
    
    $newConfig = @{
        mcpServers = @{
            TalkToFigma = @{
                command = "bunx"
                args = @("cursor-talk-to-figma-mcp@latest")
            }
        }
    }
    
    $newConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpPath
    Write-Host "Created mcp.json with TalkToFigma configuration" -ForegroundColor Green
    exit 0
}

Write-Host "Reading existing mcp.json..." -ForegroundColor Yellow
$content = Get-Content $mcpPath -Raw
$config = $content | ConvertFrom-Json

if ($config.mcpServers.TalkToFigma) {
    Write-Host "TalkToFigma already exists in mcp.json" -ForegroundColor Yellow
    Write-Host "Current TalkToFigma config:" -ForegroundColor Gray
    $config.mcpServers.TalkToFigma | ConvertTo-Json -Depth 10 | Write-Host
    exit 0
}

Write-Host "Adding TalkToFigma to existing configuration..." -ForegroundColor Yellow

# Add TalkToFigma server
$talkToFigmaConfig = @{
    command = "bunx"
    args = @("cursor-talk-to-figma-mcp@latest")
}

$config.mcpServers | Add-Member -MemberType NoteProperty -Name "TalkToFigma" -Value $talkToFigmaConfig

# Save updated config
$config | ConvertTo-Json -Depth 10 | Set-Content $mcpPath

Write-Host "Successfully added TalkToFigma to mcp.json" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Add your Figma access token to the TalkToFigma config" -ForegroundColor White
Write-Host "2. Install Bun if not already installed" -ForegroundColor White
Write-Host "3. Install Figma plugin from Figma Community" -ForegroundColor White
Write-Host "4. Restart Cursor IDE" -ForegroundColor White
