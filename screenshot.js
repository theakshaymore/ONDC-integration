const puppeteer = require("puppeteer");

// await call
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://console.cloud.google.com/monitoring/dashboards", {
    waitUntil: "networkidle2",
  });

  // TODO: Automate login if not already logged in (see Note below).
  await page.screenshot({ path: "dashboard.png", fullPage: true });

  await browser.close();
})();
