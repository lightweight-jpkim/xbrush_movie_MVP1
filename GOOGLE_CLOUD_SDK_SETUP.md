# Google Cloud SDK Installation Guide for macOS

## Installation Options

### Option 1: Using Homebrew (Recommended)
If you have Homebrew installed:

```bash
brew install --cask google-cloud-sdk
```

### Option 2: Interactive Installer
1. Download the installer:
```bash
curl https://sdk.cloud.google.com | bash
```

2. Restart your shell:
```bash
exec -l $SHELL
```

3. Initialize the SDK:
```bash
gcloud init
```

### Option 3: Manual Installation
1. Download the archive:
```bash
cd ~
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-darwin-arm.tar.gz
```

2. Extract the archive:
```bash
tar -xf google-cloud-cli-darwin-arm.tar.gz
```

3. Run the install script:
```bash
./google-cloud-sdk/install.sh
```

## Post-Installation Setup

1. **Initialize gcloud**:
```bash
gcloud init
```

2. **Authenticate**:
```bash
gcloud auth login
```

3. **Set default project**:
```bash
gcloud config set project xbrush-moviemaker-mvp
```

## Verify Installation

```bash
gcloud version
```

## Common Commands

- `gcloud projects list` - List all projects
- `gcloud config list` - Show current configuration
- `gcloud app deploy` - Deploy to App Engine
- `gcloud functions deploy` - Deploy Cloud Functions

## Integration with Firebase

Since you're using Firebase, you might also want:
```bash
gcloud auth application-default login
```

This allows Firebase Admin SDK to use your Google Cloud credentials.