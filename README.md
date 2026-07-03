# Scribd Batch Download Utility

This repo contains a small automation utility to process many Scribd URLs using your own authenticated account session.

## 1. Setup

```powershell
npm install
```

## 2. Add your document links

Edit `urls.txt` and place one Scribd URL per line.

## 3. Run

```powershell
npm run download:scribd
```

The script opens a Chromium browser window, waits for you to sign in, and then processes each URL.

Downloaded files are saved in `.\downloads`.

## Optional flags

```powershell
node .\scripts\scribd-batch-download.mjs --input urls.txt --download-dir downloads --profile-dir .browser-profile --timeout-ms 120000
```

Use `--headless` if you do not need to see the browser.
