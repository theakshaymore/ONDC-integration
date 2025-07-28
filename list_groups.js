const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "gcp-monitor-bot" }),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

client.on("ready", async () => {
  (await client.getChats())
    .filter((c) => c.isGroup)
    .forEach((c) => console.log(`${c.name}  →  ${c.id._serialized}`));

  client.destroy();
});

client.initialize();
