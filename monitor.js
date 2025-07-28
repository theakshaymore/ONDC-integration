// monitor.js
const puppeteer = require("puppeteer");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");

const DASHBOARD_URL = "https://akshaymore.netlify.app/";
const SCREEN_PATH = path.join(__dirname, "dashboard.png");
const GROUP_ID = "120363421612780741@g.us"; // ← your real group ID
const CAPTION = "All is well";

(async () => {
  /* ── 1. Capture visible viewport only ── */
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport to match a typical monitor (adjust if you prefer)
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto(DASHBOARD_URL, { waitUntil: "networkidle2" });

  // No fullPage flag ⇒ screenshot is limited to current viewport
  await page.screenshot({ path: SCREEN_PATH });
  await browser.close();
  console.log("Screenshot saved →", SCREEN_PATH);

  /* ── 2. Send it to WhatsApp ── */
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
      // keep session alive long enough to finish the upload
      setTimeout(() => client.destroy(), 10_000);
    }
  });

  client.initialize();
})();
