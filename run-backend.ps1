Set-Location $PSScriptRoot
.\api\venv\Scripts\python.exe -m uvicorn api.main:app --reload --port 8000
