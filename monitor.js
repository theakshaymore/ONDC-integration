/* monitor.js — one-file flow
 *  1. grab visible dashboard portion
 *  2. push image + caption to WhatsApp group
 *  3. append all console output to custom_log.txt
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

/* ── customise these four lines ─────────────────────────── */
const DASHBOARD_URL = "https://akshaymore.netlify.app/";
const GROUP_ID = "120363421612780741@g.us"; // ← your real group ID
const CAPTION = "All is well";
const VIEWPORT = { width: 1920, height: 1080 }; // change if you need
/* ───────────────────────────────────────────────────────── */

const SCREEN_PATH = path.join(__dirname, "dashboard.png");
const LOG_PATH = path.join(__dirname, "custom_log.txt");

/* ── simple log-to-file wrapper ─────────────────────────── */
const logStream = fs.createWriteStream(LOG_PATH, { flags: "a" });
const stamp = () => new Date().toISOString();
["log", "info", "warn", "error"].forEach((level) => {
  const orig = console[level];
  console[level] = (...args) => {
    orig(...args); // keep terminal
    logStream.write(`[${stamp()}] [${level}] ${args.join(" ")}\n`);
  };
});
process.on("exit", () => logStream.end());
/* ───────────────────────────────────────────────────────── */

(async () => {
  /* 1. Screenshot only what’s on-screen */
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.goto(DASHBOARD_URL, { waitUntil: "networkidle2" });
  await page.screenshot({ path: SCREEN_PATH }); // no fullPage
  await browser.close();
  console.log("Screenshot saved →", SCREEN_PATH);

  /* 2. Ship it to the WhatsApp group */
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
      console.error("Failed to send:", err);
    } finally {
      setTimeout(() => client.destroy(), 10_000); // allow upload
    }
  });

  client.initialize();
})();
