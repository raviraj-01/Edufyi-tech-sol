$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$baseDir = "D:\programmingCode\vs code\Full Stack\internship"
$homeUrl = "file:///$baseDir/frontend/index.html"
$dashUrl = "file:///$baseDir/frontend/dashboard.html"

$shots = @(
    @{ Name = "hero-360.png"; Width = 360; Height = 800; Url = $homeUrl },
    @{ Name = "hero-768.png"; Width = 768; Height = 1024; Url = $homeUrl },
    @{ Name = "hero-1280.png"; Width = 1280; Height = 800; Url = $homeUrl },
    @{ Name = "hero-1440.png"; Width = 1440; Height = 900; Url = $homeUrl },
    @{ Name = "hero.png"; Width = 1440; Height = 900; Url = $homeUrl },
    @{ Name = "dashboard.png"; Width = 1280; Height = 900; Url = $dashUrl }
)

foreach ($s in $shots) {
    $out = "$baseDir\docs\screenshots\$($s.Name)"
    $w = $s.Width
    $h = $s.Height
    $u = $s.Url
    Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--no-sandbox", "--screenshot=`"$out`"", "--window-size=$w,$h", "`"$u`"" -Wait -NoNewWindow
    Write-Host "Captured: $($s.Name) ($w x $h)"
}
