import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { chromium } from "playwright";

function parseArgs(argv) {
  const options = {
    input: "urls.txt",
    profileDir: ".browser-profile",
    downloadDir: "downloads",
    timeoutMs: 120000,
    headless: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--input" && next) {
      options.input = next;
      i += 1;
      continue;
    }

    if (arg === "--profile-dir" && next) {
      options.profileDir = next;
      i += 1;
      continue;
    }

    if (arg === "--download-dir" && next) {
      options.downloadDir = next;
      i += 1;
      continue;
    }

    if (arg === "--timeout-ms" && next) {
      options.timeoutMs = Number(next);
      i += 1;
      continue;
    }

    if (arg === "--headless") {
      options.headless = true;
      continue;
    }
  }

  return options;
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("scribd.com")) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

async function loadUrls(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const all = raw
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  const valid = [];
  const invalid = [];

  for (const line of all) {
    const normalized = normalizeUrl(line);
    if (normalized) {
      valid.push(normalized);
    } else {
      invalid.push(line);
    }
  }

  return { valid, invalid };
}

async function waitForEnter(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  await rl.question(prompt);
  rl.close();
}

async function clickFirstVisible(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    const count = await locator.count();
    if (count === 0) {
      continue;
    }

    try {
      await locator.waitFor({ state: "visible", timeout: 5000 });
      await locator.click();
      return true;
    } catch {
      // Try next selector.
    }
  }

  return false;
}

async function attemptDownload(page, timeoutMs) {
  const primarySelectors = [
    "button:has-text('Download')",
    "a:has-text('Download')",
    "[aria-label*='Download']",
    "[data-e2e*='download']",
    "[data-testid*='download']"
  ];

  const modalSelectors = [
    "button:has-text('Download PDF')",
    "a:has-text('Download PDF')",
    "button:has-text('PDF')",
    "a:has-text('PDF')",
    "button:has-text('Confirm')",
    "button:has-text('Continue')"
  ];

  let download;
  try {
    const downloadPromise = page.waitForEvent("download", { timeout: timeoutMs });
    const clickedPrimary = await clickFirstVisible(page, primarySelectors);
    if (!clickedPrimary) {
      return { ok: false, reason: "No visible download control found." };
    }

    // Some Scribd flows open a modal with a final format/confirm action.
    await clickFirstVisible(page, modalSelectors);
    download = await downloadPromise;
  } catch {
    return { ok: false, reason: "No download event was triggered." };
  }

  return { ok: true, download };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(process.cwd(), options.input);
  const profileDir = path.resolve(process.cwd(), options.profileDir);
  const downloadDir = path.resolve(process.cwd(), options.downloadDir);

  await ensureDir(downloadDir);

  const { valid: urls, invalid } = await loadUrls(inputPath);

  if (urls.length === 0) {
    throw new Error("No valid Scribd URLs were found in the input file.");
  }

  if (invalid.length > 0) {
    console.log(`Skipping ${invalid.length} invalid/non-Scribd URL(s).`);
  }

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: options.headless,
    acceptDownloads: true,
    downloadsPath: downloadDir,
    viewport: { width: 1440, height: 900 }
  });

  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto("https://www.scribd.com/", { waitUntil: "domcontentloaded" });

  await waitForEnter(
    "Sign in to Scribd in the opened browser (if needed), then press Enter here to start batch download..."
  );

  const successes = [];
  const failures = [];

  for (const url of urls) {
    console.log(`Processing: ${url}`);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: options.timeoutMs });
      const result = await attemptDownload(page, options.timeoutMs);

      if (!result.ok) {
        failures.push({ url, reason: result.reason });
        console.log(`  Failed: ${result.reason}`);
        continue;
      }

      const suggestedName = result.download.suggestedFilename();
      const savePath = path.join(downloadDir, suggestedName);
      await result.download.saveAs(savePath);
      successes.push({ url, file: savePath });
      console.log(`  Downloaded: ${suggestedName}`);
    } catch (error) {
      failures.push({ url, reason: error instanceof Error ? error.message : String(error) });
      console.log("  Failed: unexpected error while processing URL.");
    }
  }

  console.log("");
  console.log(`Completed. Downloaded ${successes.length}/${urls.length}.`);
  if (failures.length > 0) {
    console.log("Failed URLs:");
    for (const failure of failures) {
      console.log(`- ${failure.url}`);
      console.log(`  Reason: ${failure.reason}`);
    }
  }

  await context.close();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
