Write-Host "🚀 Run ESLint..."
bun run lint-staged
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ESLint failed! Please fix the errors and warnings first."
    exit 1
}
Write-Host "✅ Pre-commit hook completed successfully"