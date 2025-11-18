# Deployment Guide

This guide provides instructions on how to deploy the Lane Survivor game to `flyingchangesfarm.net/LaneSurviver` using Firebase Hosting.

## 1. Project Setup

The project is configured to be hosted in a subdirectory (`/LaneSurviver`).

### Build Script
A build script (`scripts/build.js`) is provided to prepare the files for deployment. It creates a `dist/LaneSurviver` directory containing the game files.

To run the build locally:
```bash
node scripts/build.js
```

## 2. Firebase Configuration

The project uses the following Firebase configuration:
- **Project ID**: `possible-haven-471616-f0`
- **Public Directory**: `dist`
- **Hosting Path**: `/LaneSurviver` (handled by the build script structure)

## 3. Automated Deployment (GitHub Actions)

The deployment is automated using GitHub Actions. Whenever you push to the `main` branch, the workflow in `.github/workflows/firebase-deploy.yml` will:
1.  Build the project using `scripts/build.js`.
2.  Deploy the `dist` folder to Firebase Hosting.

### Required Secrets
For the GitHub Action to work, you need to add a secret to your GitHub repository:

1.  **Generate Service Account Key**:
    - Go to the Firebase Console > Project Settings > Service accounts.
    - Click "Generate new private key".
    - This will download a JSON file.

2.  **Add Secret to GitHub**:
    - Go to your GitHub repository > Settings > Secrets and variables > Actions.
    - Create a new repository secret named `FIREBASE_SERVICE_ACCOUNT_POSSIBLE_HAVEN_471616_F0`.
    - Paste the entire content of the JSON file into the secret value.

## 4. Manual Deployment (Optional)

You can also deploy manually from your local machine using the Firebase CLI (requires `firebase-tools` installed).

1.  **Login**:
    ```bash
    firebase login
    ```

2.  **Build**:
    ```bash
    node scripts/build.js
    ```

3.  **Deploy**:
    ```bash
    firebase deploy --only hosting
    ```
