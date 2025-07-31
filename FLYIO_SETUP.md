# 🚀 Fly.io Setup Instructions

## Prerequisites

### 1. Install Fly.io CLI
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Or on Windows
powershell -c "iwr https://fly.io/install.ps1 -useb | iex"
```

### 2. Login to Fly.io
```bash
flyctl auth login
```

### 3. Create the App (REQUIRED - Run this once)
```bash
# Create the app on Fly.io platform
flyctl apps create medverus-frontend

# Or use the launch command to initialize everything
flyctl launch --no-deploy
```

### 4. Verify Your API Token
```bash
# Get your API token
flyctl auth token
```

Make sure this token is set as `FLY_API_TOKEN` in your GitHub repository secrets:
- Go to GitHub repo → Settings → Secrets and variables → Actions
- Add secret: `FLY_API_TOKEN` with your token value

## Manual Deploy Test (Optional)
```bash
# Test deployment locally first
flyctl deploy
```

## GitHub Actions
Once the app exists and the secret is set, GitHub Actions will automatically deploy on push to main branch.

## Troubleshooting
- **"App not found"**: Run `flyctl apps create medverus-frontend`
- **"Unauthorized"**: Check your `FLY_API_TOKEN` in GitHub Secrets
- **"dockerfile not found"**: Ensure you're in the project root directory

## App URL
After deployment: https://medverus-frontend.fly.dev