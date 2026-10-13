# Install skills from this repo into your personal Claude Code skills folder.
#
# Usage:
#   .\scripts\install.ps1                      install every skill in skills\
#   .\scripts\install.ps1 jira-client-update   install only the named skill(s)
#   .\scripts\install.ps1 -Dest D:\somewhere   install somewhere else
#
# Default destination is ~\.claude\skills. Re-running overwrites the installed
# copy, so any local edits to it are lost.
#
# If PowerShell blocks the script, run it like this instead:
#   powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Skills,
    [string]$Dest = $(if ($env:CLAUDE_SKILLS_DIR) { $env:CLAUDE_SKILLS_DIR } else { Join-Path $HOME ".claude\skills" })
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot

# A skill is any folder under skills\ that contains a SKILL.md. This skips local
# workspace folders (evals, snapshots) that sit next to the real skills.
$available = @(Get-ChildItem -Path (Join-Path $repo "skills") -Directory |
    Where-Object { Test-Path (Join-Path $_.FullName "SKILL.md") } |
    ForEach-Object { $_.Name })

if ($available.Count -eq 0) {
    Write-Error "No skills found under $repo\skills"
}

if ($Skills -and $Skills.Count -gt 0) {
    foreach ($name in $Skills) {
        if ($available -notcontains $name) {
            Write-Error "Unknown skill: $name. Available: $($available -join ', ')"
        }
    }
    $selected = $Skills
} else {
    $selected = $available
}

New-Item -ItemType Directory -Force -Path $Dest | Out-Null
foreach ($name in $selected) {
    $target = Join-Path $Dest $name
    if (Test-Path $target) { Remove-Item -Recurse -Force $target }
    Copy-Item -Recurse -Path (Join-Path $repo "skills\$name") -Destination $target
    $evals = Join-Path $target "evals"
    if (Test-Path $evals) { Remove-Item -Recurse -Force $evals }
    Write-Host "Installed $name -> $target"
}

Write-Host ""
Write-Host "Done. New skills are normally picked up live. If a session that was already"
Write-Host "running does not see them, start a new session or try /reload-skills."
