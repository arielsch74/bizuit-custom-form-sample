<#
.SYNOPSIS
    Prepares Next.js deployment by replacing runtime basePath placeholder.

.DESCRIPTION
    This PowerShell script replaces the __RUNTIME_BASEPATH__ placeholder in Next.js build output
    with the actual basePath value from environment variable.

.PARAMETER RuntimeBasePath
    The runtime base path to use (e.g., "/arielschBIZUITCustomForms")

.EXAMPLE
    .\prepare-deployment.ps1 -RuntimeBasePath "/arielschBIZUITCustomForms"

.EXAMPLE
    $env:RUNTIME_BASEPATH="/myapp"; .\prepare-deployment.ps1
#>

param(
    [string]$RuntimeBasePath = $env:RUNTIME_BASEPATH
)

# Configuration
$Placeholder = "/__RUNTIME_BASEPATH__"
$ScriptDir = Split-Path -Parent $PSCommandPath
$BuildDir = Join-Path $ScriptDir ".." ".next" "standalone" ".next"
$FallbackBuildDir = Join-Path $ScriptDir ".." ".next"

# Colors for output
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Success {
    param([string]$Message)
    Write-Host "✓ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ " -ForegroundColor Yellow -NoNewline
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ " -ForegroundColor Red -NoNewline
    Write-Host $Message -ForegroundColor Red
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host ("=" * 60) -ForegroundColor Blue
    Write-Host ""
}

# Main execution
Write-Header "Next.js Runtime basePath Configuration (Windows)"

# Determine build directory
if (Test-Path $BuildDir) {
    $TargetDir = $BuildDir
} elseif (Test-Path $FallbackBuildDir) {
    $TargetDir = $FallbackBuildDir
} else {
    Write-Error "Build directory not found. Please run 'npm run build' first."
    exit 1
}

Write-Info "Configuration:"
Write-Host "  Placeholder: " -NoNewline
Write-Host $Placeholder -ForegroundColor Yellow
Write-Host "  Runtime basePath: " -NoNewline
if ($RuntimeBasePath) {
    Write-Host $RuntimeBasePath -ForegroundColor Green
} else {
    Write-Host "(root)" -ForegroundColor Green
}
Write-Host "  Build directory: " -NoNewline
Write-Host (Resolve-Path -Path $TargetDir -Relative) -ForegroundColor Blue
Write-Host ""

# Find all JS and HTML files
Write-Info "Searching for files..."
$Files = Get-ChildItem -Path $TargetDir -Include "*.js", "*.html" -Recurse -File | Where-Object {
    $_.DirectoryName -notmatch "node_modules|cache"
}
Write-Host "  Found " -NoNewline
Write-Host $Files.Count -ForegroundColor Yellow -NoNewline
Write-Host " files to process"
Write-Host ""

# Process files
$FilesProcessed = 0
$FilesModified = 0
$TotalReplacements = 0

Write-Info "Processing files:"
foreach ($File in $Files) {
    $Content = Get-Content -Path $File.FullName -Raw -Encoding UTF8

    # Count occurrences
    $Matches = [regex]::Matches($Content, [regex]::Escape($Placeholder))
    $Count = $Matches.Count

    if ($Count -gt 0) {
        # Replace all occurrences
        $NewContent = $Content.Replace($Placeholder, $RuntimeBasePath)

        # Write back with UTF8 encoding without BOM
        $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($File.FullName, $NewContent, $Utf8NoBom)

        $FilesModified++
        $TotalReplacements += $Count

        $RelativePath = Resolve-Path -Path $File.FullName -Relative
        Write-Success "$RelativePath ($Count replacement$(if ($Count -gt 1) {'s'}))"
    }

    $FilesProcessed++
}

# Summary
Write-Header "Summary"
Write-Host "  Files processed: " -NoNewline
Write-Host $FilesProcessed -ForegroundColor Yellow
Write-Host "  Files modified: " -NoNewline
Write-Host $FilesModified -ForegroundColor Green
Write-Host "  Total replacements: " -NoNewline
Write-Host $TotalReplacements -ForegroundColor Green
Write-Host ""

if ($FilesModified -eq 0) {
    Write-Warning "No files were modified."
    Write-Warning "The placeholder '$Placeholder' was not found in any files."
    Write-Warning "This might indicate the build was not done with NODE_ENV=production."
} else {
    Write-Success "basePath configuration completed successfully!"
}

Write-Host ""