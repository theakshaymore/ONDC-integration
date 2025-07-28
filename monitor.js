require("dotenv").config();

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// Configurations
const DASHBOARD_URL = process.env.DASHBOARD_UR;
const GROUP_ID = process.env.GROUP_ID;
const CAPTION = "All is well ✅";
const VIEWPORT = { width: 1920, height: 1080 };

const SCREEN_PATH = path.join(
  __dirname,
  process.env.SCREENSHOT_PATH || "myscreenshots/dashboard.png"
);
const LOG_PATH = path.join(
  __dirname,
  process.env.LOGS_PATH || "mylogs/custom_log.txt"
);

// log-to-file wrapper
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

(async () => {
  // take screenshot
  // const browser = await puppeteer.launch({ headless: true });

  /* const browser = await puppeteer.launch({
     headless: true,
     userDataDir: path.join(__dirname, "chrome-profile"),
   }); */

  // added by Monica
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    userDataDir: "D:\\Javascript\\ondcauto\\chrome-profile",
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.goto(DASHBOARD_URL, { waitUntil: "networkidle2" });

  //added pause for google auth issue
  // await page.waitForTimeout(1200000);
  // await new Promise((res) => setTimeout(res, 1200000));

  // addition by Monica
  // element that exists only when the dashboard finished loading
  await page.waitForSelector("canvas,iframe,div.chart");
  await page.screenshot({ path: SCREEN_PATH }); // no fullPage
  await browser.close();
  console.log("Screenshot saved →", SCREEN_PATH);

  //send to whatsapp
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
