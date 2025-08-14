Write-Host "🚀 Menjalankan ESLint..."
bun run lint-staged
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ESLint gagal! Mohon perbaiki error dan warning terlebih dahulu."
    exit 1
}
Write-Host "✅ Pre-commit hook selesai dengan sukses"