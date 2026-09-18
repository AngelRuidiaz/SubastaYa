# =====================================================================
#  Prueba de concurrencia (Windows / PowerShell)
#  Uso:  .\prueba-concurrencia.ps1 -Puerto 5000 -SubastaId 1 -Monto 60000
#  Esperado: un 201 Created y un 409 Conflict.
# =====================================================================
param(
    [int]$Puerto = 5000,
    [int]$SubastaId = 1,
    [decimal]$Monto = 60000
)

$url = "http://localhost:$Puerto/api/subastas/$SubastaId/pujas"
$cuerpo = @{ monto = $Monto } | ConvertTo-Json

Write-Host "Dos pujas simultaneas de $Monto sobre la subasta $SubastaId..." -ForegroundColor Cyan
Write-Host ""

$trabajos = @(2, 3) | ForEach-Object {
    Start-Job -ScriptBlock {
        param($url, $cuerpo, $usuarioId)
        try {
            $r = Invoke-WebRequest -Uri $url -Method Post -Body $cuerpo `
                -ContentType "application/json" `
                -Headers @{ "X-Usuario-Id" = "$usuarioId" } -UseBasicParsing
            "Usuario $usuarioId  ->  HTTP $($r.StatusCode)"
        }
        catch {
            "Usuario $usuarioId  ->  HTTP $($_.Exception.Response.StatusCode.value__)"
        }
    } -ArgumentList $url, $cuerpo, $_
}

$trabajos | Wait-Job | Receive-Job
$trabajos | Remove-Job

Write-Host ""
Write-Host "Esperado: un 201 y un 409." -ForegroundColor Yellow
