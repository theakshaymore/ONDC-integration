require("dotenv").config();

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// Configurations
const DASHBOARD_URL = process.env.DASHBOARD_URL;
const GROUP_ID = process.env.GROUP_ID;
const CAPTION = "All is well ✅";
const VIEWPORT = { width: 1920, height: 1080 };

// File paths
const SCREEN_PATH = path.join(
  __dirname,
  process.env.SCREENSHOT_PATH || "myscreenshots/dashboard.png"
);
const LOG_PATH = path.join(
  __dirname,
  process.env.LOGS_PATH || "mylogs/custom_log.txt"
);

// Ensure screenshot and log directories exist
fs.mkdirSync(path.dirname(SCREEN_PATH), { recursive: true });
fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });

// log-to-file wrapper
const logStream = fs.createWriteStream(LOG_PATH, { flags: "a" });
const stamp = () => new Date().toISOString();
["log", "info", "warn", "error"].forEach((level) => {
  const orig = console[level];
  console[level] = (...args) => {
    orig(...args); // also log to terminal
    logStream.write(`[${stamp()}] [${level}] ${args.join(" ")}\n`);
  };
});
process.on("exit", () => logStream.end());

(async () => {
  // Launch Puppeteer with Linux Chromium
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/usr/bin/chromium-browser",
    userDataDir: path.join(__dirname, "chrome-profile"),
    args: ["--no-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.goto(DASHBOARD_URL, { waitUntil: "networkidle2" });

    // Wait for dashboard elements indicating full load
    await page.waitForSelector("canvas,iframe,div.chart", { timeout: 60000 });

    // Take screenshot (will overwrite each time)
    await page.screenshot({ path: SCREEN_PATH });
    console.log("Screenshot saved →", SCREEN_PATH);
  } catch (err) {
    console.error("Error during screenshot:", err);
    await browser.close();
    process.exit(1);
  }

  await browser.close();

  // Initialize WhatsApp client to send the screenshot
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: "gcp-monitor-bot" }),
    puppeteer: { headless: true, args: ["--no-sandbox"] },
  });

  client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

  client.on("ready", async () => {
    try {
      const media = MessageMedia.fromFilePath(SCREEN_PATH);
      await client.sendMessage(GROUP_ID, media, { caption: CAPTION });
      console.log("Screenshot sent to group!");
    } catch (err) {
      console.error("Failed to send screenshot:", err);
    } finally {
      // Delay destroy to allow upload finish
      setTimeout(() => client.destroy(), 10_000);
    }
  });

  client.initialize();
})();
