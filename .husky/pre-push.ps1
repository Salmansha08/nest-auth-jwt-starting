Write-Host "🏗️ Run build before commit..."
bun run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Build failed! Commit aborted."
  exit 1
}
Write-Host "✅ Build OK. Proceeding to commit."
exit 0