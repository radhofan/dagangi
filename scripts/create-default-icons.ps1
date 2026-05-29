Add-Type -AssemblyName System.Drawing

$assets = Join-Path (Get-Location) "assets"

function New-IconBitmap {
  param(
    [string]$Path,
    [int]$Size,
    [bool]$Transparent = $false,
    [bool]$IconOnly = $false
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear($(if ($Transparent) { [System.Drawing.Color]::Transparent } else { [System.Drawing.Color]::White }))

  $scale = $Size / 1024.0
  $penWidth = [Math]::Max(10, [int](36 * $scale))
  $blackPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::Black), $penWidth
  $blackPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $blackPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)

  $box = [int](220 * $scale)
  $boxSize = [int](584 * $scale)
  if (-not $IconOnly) {
    $radius = [int](148 * $scale)
    $roundedPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $roundedPath.AddArc($box, $box, $radius, $radius, 180, 90)
    $roundedPath.AddArc($box + $boxSize - $radius, $box, $radius, $radius, 270, 90)
    $roundedPath.AddArc($box + $boxSize - $radius, $box + $boxSize - $radius, $radius, $radius, 0, 90)
    $roundedPath.AddArc($box, $box + $boxSize - $radius, $radius, $radius, 90, 90)
    $roundedPath.CloseFigure()
    $graphics.FillPath($whiteBrush, $roundedPath)
    $graphics.DrawPath($blackPen, $roundedPath)
  }

  $points = @(
    [System.Drawing.Point]::new([int](300 * $scale), [int](438 * $scale)),
    [System.Drawing.Point]::new([int](724 * $scale), [int](438 * $scale)),
    [System.Drawing.Point]::new([int](676 * $scale), [int](298 * $scale)),
    [System.Drawing.Point]::new([int](348 * $scale), [int](298 * $scale))
  )
  $graphics.DrawPolygon($blackPen, $points)
  $graphics.DrawLine($blackPen, [int](292 * $scale), [int](438 * $scale), [int](732 * $scale), [int](438 * $scale))
  $graphics.DrawLine($blackPen, [int](328 * $scale), [int](438 * $scale), [int](328 * $scale), [int](682 * $scale))
  $graphics.DrawLine($blackPen, [int](696 * $scale), [int](438 * $scale), [int](696 * $scale), [int](682 * $scale))
  $graphics.DrawLine($blackPen, [int](328 * $scale), [int](682 * $scale), [int](696 * $scale), [int](682 * $scale))
  $graphics.DrawRectangle($blackPen, [int](426 * $scale), [int](526 * $scale), [int](172 * $scale), [int](156 * $scale))
  $graphics.DrawLine($blackPen, [int](388 * $scale), [int](298 * $scale), [int](364 * $scale), [int](438 * $scale))
  $graphics.DrawLine($blackPen, [int](512 * $scale), [int](298 * $scale), [int](512 * $scale), [int](438 * $scale))
  $graphics.DrawLine($blackPen, [int](636 * $scale), [int](298 * $scale), [int](660 * $scale), [int](438 * $scale))

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-IconBitmap -Path (Join-Path $assets "icon.png") -Size 1024
New-IconBitmap -Path (Join-Path $assets "splash-icon.png") -Size 512
New-IconBitmap -Path (Join-Path $assets "favicon.png") -Size 64
New-IconBitmap -Path (Join-Path $assets "android-icon-background.png") -Size 1024
New-IconBitmap -Path (Join-Path $assets "android-icon-foreground.png") -Size 1024 -Transparent $true -IconOnly $true
New-IconBitmap -Path (Join-Path $assets "android-icon-monochrome.png") -Size 1024 -Transparent $true -IconOnly $true

Write-Host "Default Dagangi icons regenerated."
