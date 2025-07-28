// monitor.js
const puppeteer = require("puppeteer");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");

const DASHBOARD_URL = "https://akshaymore.netlify.app/";
const SCREEN_PATH = path.join(__dirname, "dashboard.png");
const GROUP_ID = "120363421612780741@g.us"; // <— paste the real id
const CAPTION = "All is well";

(async () => {
  /* ---------- 1. Take the screenshot ---------- */
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(DASHBOARD_URL, { waitUntil: "networkidle2" });
  await page.screenshot({ path: SCREEN_PATH, fullPage: true });
  await browser.close();
  console.log("Screenshot saved →", SCREEN_PATH);

  /* ---------- 2. Send it on WhatsApp ---------- */
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
      // Give WhatsApp Web a little time to finish the upload
      setTimeout(() => client.destroy(), 10_000);
    }
  });

  client.initialize();
})();
