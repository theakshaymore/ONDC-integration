const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

/* reuse the same LocalAuth folder you already use in the main script
   so you will NOT have to scan the QR again if you’re already linked */
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "gcp-monitor-bot" }), // or 'Default'
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

client.on("ready", async () => {
  (await client.getChats())
    .filter((c) => c.isGroup)
    .forEach((c) => console.log(`${c.name}  →  ${c.id._serialized}`));

  client.destroy(); // exit after printing
});

client.initialize();
