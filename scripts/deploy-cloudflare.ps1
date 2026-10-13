$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $ProjectRoot

$Npm = 'C:\Program Files\nodejs\npm.cmd'
if (-not (Test-Path -LiteralPath $Npm)) {
  $NpmCommand = Get-Command npm -ErrorAction SilentlyContinue
  if (-not $NpmCommand) { throw '找不到 npm。请先安装 Node.js，再重新运行。' }
  $Npm = $NpmCommand.Source
}
$NpmCache = Join-Path $ProjectRoot '.npm-cache'
$NodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue | Select-Object -First 1
if ($NodeCommand) {
  $Node = $NodeCommand.Source
} elseif (Test-Path -LiteralPath 'C:\Program Files\nodejs\node.exe') {
  $Node = 'C:\Program Files\nodejs\node.exe'
} else {
  throw '找不到 Node.js。请安装 Node.js 后重新运行这个启动器。'
}
$NodeDirectory = Split-Path -Parent $Node
$env:PATH = "$NodeDirectory;$env:PATH"

$Vite = Join-Path $ProjectRoot 'node_modules\.bin\vite.cmd'
if (-not (Test-Path -LiteralPath $Vite)) {
  throw '缺少网站构建组件。请先在项目文件夹运行 npm install，然后重新双击 deploy-r2.cmd。'
}

function Invoke-Wrangler([string[]]$Arguments) {
  $CommandOutput = & $Npm exec --cache $NpmCache --yes --package='wrangler@4.150.0' -- wrangler @Arguments 2>&1
  $ExitCode = $LASTEXITCODE
  $CommandOutput | ForEach-Object { Write-Host $_ }
  if ($ExitCode -ne 0) { throw "Cloudflare 命令失败：$($Arguments -join ' ')" }
  return $CommandOutput
}

Write-Host '先准备网站文件（视频原件继续保存在本地）…' -ForegroundColor Cyan
& $Vite build --config vite.pages.config.js
if ($LASTEXITCODE -ne 0) { throw '网站构建失败。' }
& $Node (Join-Path $ProjectRoot 'scripts\prepare-pages.mjs')
if ($LASTEXITCODE -ne 0) { throw '网站静态文件准备失败。' }
if (Get-ChildItem (Join-Path $ProjectRoot 'release') -Recurse -File -Filter '*.mp4') { throw '部署文件里仍有 MP4，停止以免把大视频重复上传到网站主机。' }

Write-Host ''
Write-Host '现在连接 Cloudflare。浏览器会打开登录和授权页面；请在浏览器中自行登录，完成后回到这个窗口。' -ForegroundColor Yellow
Invoke-Wrangler @('login')
Invoke-Wrangler @('whoami')

$BucketName = 'yuta-portfolio-videos'
$BucketList = Invoke-Wrangler @('r2', 'bucket', 'list')
if (-not $BucketList) {
  throw '读取 R2 存储桶失败。如果页面要求付款或添加付款方式，请先停止，不要购买任何服务。'
}
if (($BucketList | Out-String) -notmatch [regex]::Escape($BucketName)) {
  Write-Host '创建免费用量内的视频存储…' -ForegroundColor Cyan
  try { Invoke-Wrangler @('r2', 'bucket', 'create', $BucketName) }
  catch { throw "R2 存储未能启用；若页面要求付费或添加付款方式，请停止，不要购买任何服务。详情：$_" }
}

$VideoDirectory = Join-Path $ProjectRoot 'public\videos'
$Videos = Get-ChildItem -LiteralPath $VideoDirectory -File -Filter '*.mp4' | Sort-Object Name
if ($Videos.Count -eq 0) { throw '没有找到作品视频。' }
foreach ($Video in $Videos) {
  Write-Host "上传视频：$($Video.Name)" -ForegroundColor Cyan
  Invoke-Wrangler @('r2', 'object', 'put', "$BucketName/videos/$($Video.Name)", '--file', $Video.FullName, '--remote', '--content-type', 'video/mp4', '--cache-control', 'public, max-age=31536000, immutable')
}

Write-Host '发布网站和 R2 播放接口…' -ForegroundColor Cyan
$DeployOutput = Invoke-Wrangler @('deploy', '--config', 'cloudflare/video-worker/wrangler.toml')
if (-not $DeployOutput) { throw 'Cloudflare 发布失败。' }

$DeployText = $DeployOutput -join "`n"
$UrlMatch = [regex]::Match($DeployText, 'https://[^\s]+\.workers\.dev')
if (-not $UrlMatch.Success) { throw '网站已上传，但部署地址没有从 Wrangler 输出中识别出来。' }
$SiteUrl = $UrlMatch.Value.TrimEnd('.', ',', ')')

Write-Host "正在确认公开首页：$SiteUrl" -ForegroundColor Cyan
$Home = Invoke-WebRequest -Uri $SiteUrl -Method Head -UseBasicParsing
if ($Home.StatusCode -ne 200) { throw "首页检查失败，状态码：$($Home.StatusCode)" }
$VideoProbe = Invoke-WebRequest -Uri "$SiteUrl/videos/ka-dian.mp4" -Headers @{ Range = 'bytes=0-1' } -UseBasicParsing
if ($VideoProbe.StatusCode -ne 206 -or $VideoProbe.Headers['Content-Range'] -notlike 'bytes 0-1/*') {
  throw '首页已发布，但视频分段播放检查未通过。'
}

Write-Host ''
Write-Host "上线完成：$SiteUrl" -ForegroundColor Green
Write-Host '首页和作品视频可直接公开访问，无需访客登录。'
