param(
    [string]$Token,
    [string]$Model = 'Falconsai/nsfw_image_detection'
)

$ErrorActionPreference = 'Stop'
$serviceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $serviceRoot
$venvPath = Join-Path $serviceRoot '.venv'
$pythonPath = Join-Path $venvPath 'Scripts\python.exe'

if (-not (Test-Path $pythonPath)) {
    python -m venv $venvPath
    & $pythonPath -m pip install --upgrade pip
    & $pythonPath -m pip install -r (Join-Path $serviceRoot 'requirements.txt')
}

if ([string]::IsNullOrWhiteSpace($Token)) {
    throw 'Passe un token : .\start-moderation.ps1 -Token "un-secret-long"'
}

$env:MODERATION_API_TOKEN = $Token
$env:NSFW_MODEL_ID = $Model
$env:IMAGES_ROOT = Join-Path $projectRoot 'storage\app\public'
$env:HF_HOME = Join-Path $serviceRoot '.models'

Set-Location $serviceRoot
& $pythonPath -m uvicorn app:app --host 127.0.0.1 --port 8000
