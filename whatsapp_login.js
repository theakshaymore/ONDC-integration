const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "gcp-monitor-bot" }),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
client.on("ready", () => {
  console.log("WhatsApp client is ready! Linked up.");
  process.exit(0); // End after linking
});

client.initialize();
