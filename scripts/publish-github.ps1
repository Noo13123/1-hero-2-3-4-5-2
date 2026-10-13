$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.Net.Http

$Owner = 'Noo13123'
$Repository = '1-hero-2-3-4-5-2'
$ReleaseTag = 'portfolio-media-v1'
$SiteUrl = 'https://noo13123.github.io/1-hero-2-3-4-5-2/'
$ApiRoot = "https://api.github.com/repos/$Owner/$Repository"
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$GitDir = Join-Path $Root '.portfolio-publish-git'
$env:GIT_DIR = $GitDir
$env:GIT_WORK_TREE = $Root
$Git = Join-Path $env:LOCALAPPDATA 'GitHubDesktop\app-3.6.7\resources\app\git\cmd\git.exe'
$GitBin = Join-Path $env:LOCALAPPDATA 'GitHubDesktop\app-3.6.7\resources\app\git\mingw64\bin'
$env:PATH = (Split-Path $Git) + ";$GitBin;$env:PATH"
$env:GCM_CREDENTIAL_STORE = 'dpapi'

function Get-HttpStatusCode($ErrorRecord) {
  try { return [int]$ErrorRecord.Exception.Response.StatusCode } catch { return 0 }
}

function Test-AssetNameEqual {
  param([string]$AssetName, [string]$FileName)
  $decodedName = $AssetName
  try { $decodedName = [Uri]::UnescapeDataString($AssetName) } catch { }
  return [string]::Equals($decodedName, $FileName, [StringComparison]::OrdinalIgnoreCase)
}

function Invoke-GitHubApi {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Uri,
    [Parameter()][object]$Body
  )
  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $script:Headers -TimeoutSec 120
  }
  $json = ConvertTo-Json -InputObject $Body -Depth 10
  return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $script:Headers -ContentType 'application/json' -Body $json -TimeoutSec 120
}

function Ensure-GitHubPages {
  $uri = "$ApiRoot/pages"
  $pages = $null
  try {
    $pages = Invoke-GitHubApi -Method GET -Uri $uri
  } catch {
    if ((Get-HttpStatusCode $_) -ne 404) { throw }
  }

  $body = @{ build_type = 'workflow'; source = @{ branch = 'main'; path = '/' } }
  if ($null -eq $pages) {
    Write-Host 'Enabling GitHub Pages with GitHub Actions...'
    return Invoke-GitHubApi -Method POST -Uri $uri -Body $body
  }
  if ($pages.build_type -ne 'workflow') {
    Write-Host 'Switching GitHub Pages to GitHub Actions...'
    return Invoke-GitHubApi -Method PUT -Uri $uri -Body $body
  }
  return $pages
}

function Get-GitHubCredential {
  $request = "protocol=https`nhost=github.com`n`n"
  $lines = $request | & $Git -C $Root -c http.sslBackend=openssl credential fill
  if ($LASTEXITCODE -ne 0) { throw 'GitHub login is not available to this Windows account yet.' }
  $fields = @{}
  foreach ($line in $lines) {
    $separator = $line.IndexOf('=')
    if ($separator -gt 0) { $fields[$line.Substring(0, $separator)] = $line.Substring($separator + 1) }
  }
  if (-not $fields.ContainsKey('password') -or [string]::IsNullOrWhiteSpace($fields['password'])) {
    throw 'No GitHub credential was found. Sign in from this same Windows account, then run this file again.'
  }
  return $fields['password']
}

function Ensure-Release {
  $uri = "$ApiRoot/releases/tags/$ReleaseTag"
  try {
    return Invoke-GitHubApi -Method GET -Uri $uri
  } catch {
    if ((Get-HttpStatusCode $_) -ne 404) { throw }
  }
  Write-Host "Creating public media release $ReleaseTag..."
  $body = @{
    tag_name = $ReleaseTag
    target_commitish = 'main'
    name = 'Yuta Okkotsu Portfolio Videos'
    body = 'Video files for the public portfolio website.'
    draft = $false
    prerelease = $false
  }
  return Invoke-GitHubApi -Method POST -Uri "$ApiRoot/releases" -Body $body
}

function Upload-ReleaseAsset {
  param(
    [Parameter(Mandatory = $true)][object]$Release,
    [Parameter(Mandatory = $true)][System.IO.FileInfo]$File,
    [Parameter(Mandatory = $true)][System.Net.Http.HttpClient]$Client
  )
  if ($File.Length -ge 2GB) { throw "GitHub Releases cannot accept this large file: $($File.Name)" }
  $existing = @($Release.assets | Where-Object { Test-AssetNameEqual -AssetName ([string]$_.name) -FileName $File.Name }) | Select-Object -First 1
  if ($null -ne $existing) {
    if ([long]$existing.size -ne [long]$File.Length) {
      throw "A release asset named $($File.Name) already exists with a different size; it was left untouched."
    }
    Write-Host "Already uploaded: $($File.Name)"
    return
  }

  $base = $Release.upload_url -replace '\{\?name,label\}$', ''
  $encodedName = [Uri]::EscapeDataString($File.Name)
  $uploadUri = "$base`?name=$encodedName"
  $stream = [System.IO.File]::OpenRead($File.FullName)
  $content = [System.Net.Http.StreamContent]::new($stream)
  $content.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::new('application/octet-stream')
  try {
    Write-Host ("Uploading {0} ({1:N0} MB)..." -f $File.Name, ($File.Length / 1MB))
    $response = $Client.PostAsync($uploadUri, $content).GetAwaiter().GetResult()
    if (-not $response.IsSuccessStatusCode) {
      $responseBody = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
      if ([int]$response.StatusCode -eq 422 -and $responseBody -match 'already_exists') {
        $latestRelease = Invoke-GitHubApi -Method GET -Uri "$ApiRoot/releases/tags/$ReleaseTag"
        $duplicate = @($latestRelease.assets | Where-Object { Test-AssetNameEqual -AssetName ([string]$_.name) -FileName $File.Name }) | Select-Object -First 1
        if ($null -eq $duplicate) {
          $sameSizeAssets = @($latestRelease.assets | Where-Object { [long]$_.size -eq [long]$File.Length })
          if ($sameSizeAssets.Count -eq 1) { $duplicate = $sameSizeAssets[0] }
        }
        if ($null -ne $duplicate -and [long]$duplicate.size -eq [long]$File.Length) {
          $Release.assets = @($latestRelease.assets)
          Write-Host "Already uploaded: $($File.Name)"
          return
        }
      }
      throw "Upload failed for $($File.Name): HTTP $([int]$response.StatusCode) $responseBody"
    }
    $uploadedAsset = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
    $Release.assets += $uploadedAsset
    Write-Host "Uploaded: $($File.Name)"
  } finally {
    $content.Dispose()
    $stream.Dispose()
    if ($null -ne $response) { $response.Dispose() }
  }
}

try {
  if (-not (Test-Path $Git)) { throw 'GitHub Desktop Git could not be found on this computer.' }
  $branch = (& $Git -C $Root branch --show-current).Trim()
  if ($branch -ne 'clean-main') { throw "Expected the prepared clean-main branch, but found '$branch'." }
  $head = (& $Git -C $Root rev-parse HEAD).Trim()
  $firstCommit = (& $Git -C $Root rev-parse 'HEAD^').Trim()
  $videoDirectory = Join-Path $Root 'public\videos'
  $videoFiles = @(Get-ChildItem -LiteralPath $videoDirectory -File -Filter '*.mp4' | Sort-Object Name)
  if ($videoFiles.Count -ne 9) { throw "Expected 9 portfolio videos in public\videos; found $($videoFiles.Count)." }

  Write-Host 'Checking the GitHub account...'
  $token = Get-GitHubCredential
  $script:Headers = @{
    Authorization = "Bearer $token"
    Accept = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2022-11-28'
    'User-Agent' = 'YutaPortfolioPublisher'
  }
  $account = Invoke-GitHubApi -Method GET -Uri 'https://api.github.com/user'
  if ($account.login -ine $Owner) { throw "Signed in as '$($account.login)', expected GitHub account '$Owner'; no files were uploaded." }
  $remote = Invoke-GitHubApi -Method GET -Uri $ApiRoot
  if ($remote.private) { throw 'The GitHub repository is private; visitors need a public repository for this free site.' }

  $remoteRefs = @(& $Git -C $Root -c http.sslBackend=openssl ls-remote origin refs/heads/main)
  $remoteMain = ''
  if ($remoteRefs.Count -gt 0) { $remoteMain = ($remoteRefs[0] -split '\s+')[0] }
  if ($remoteMain) {
    & $Git -C $Root -c http.sslBackend=openssl merge-base --is-ancestor $remoteMain $head
    if ($LASTEXITCODE -ne 0) { throw 'The remote main branch is not part of the prepared publishing history; it was not overwritten.' }
  }
  if (-not $remoteMain) {
    Write-Host 'Uploading the website source to the public repository...'
    & $Git -C $Root -c http.sslBackend=openssl push origin ("{0}:refs/heads/main" -f $firstCommit)
    if ($LASTEXITCODE -ne 0) { throw 'Could not upload the website source to GitHub.' }
  }

  $null = Ensure-GitHubPages
  $release = Ensure-Release

  $client = [System.Net.Http.HttpClient]::new()
  $client.Timeout = [TimeSpan]::FromMinutes(30)
  $client.DefaultRequestHeaders.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $token)
  $client.DefaultRequestHeaders.Accept.Add([System.Net.Http.Headers.MediaTypeWithQualityHeaderValue]::new('application/vnd.github+json'))
  $client.DefaultRequestHeaders.UserAgent.ParseAdd('YutaPortfolioPublisher/1.0')
  $client.DefaultRequestHeaders.Add('X-GitHub-Api-Version', '2022-11-28')
  foreach ($file in $videoFiles) { Upload-ReleaseAsset -Release $release -File $file -Client $client }

  $probeClient = [System.Net.Http.HttpClient]::new()
  $probeClient.Timeout = [TimeSpan]::FromMinutes(2)
  foreach ($videoFile in $videoFiles) {
    $videoName = $videoFile.Name
    $encodedName = [Uri]::EscapeDataString($videoName)
    $assetUrl = "https://github.com/$Owner/$Repository/releases/download/$ReleaseTag/$encodedName"
    $probe = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Get, $assetUrl)
    $probe.Headers.Range = [System.Net.Http.Headers.RangeHeaderValue]::new(0, 1023)
    $probeResponse = $probeClient.SendAsync($probe, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
    if ([int]$probeResponse.StatusCode -ne 206) {
      throw "Anonymous playback check failed for $($videoName): HTTP $([int]$probeResponse.StatusCode)."
    }
    Write-Host "Anonymous video check passed: $videoName"
    $probeResponse.Dispose()
    $probe.Dispose()
  }
  $probeClient.Dispose()
  $client.Dispose()

  if ($remoteMain -ne $head) {
    Write-Host 'Publishing the deployment workflow...'
    & $Git -C $Root -c http.sslBackend=openssl push origin 'clean-main:refs/heads/main'
    if ($LASTEXITCODE -ne 0) { throw 'Videos are uploaded, but the Pages deployment workflow could not be pushed.' }
  }

  Write-Host ''
  Write-Host 'Publishing steps finished.'
  Write-Host "Site: $SiteUrl"
  Write-Host 'GitHub Actions may need a few minutes to finish the first deployment.'
  Write-Host 'The videos and website files are public, with no visitor login required.'
} catch {
  Write-Host ''
  Write-Host "PUBLISHING STOPPED: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
} finally {
  if ($null -ne $token) { $token = $null }
  if ($null -ne $script:Headers) { $script:Headers = $null }
}
