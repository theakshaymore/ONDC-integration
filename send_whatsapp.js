const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  const chatName = "OndcIntegration";
  const filePath = "./dashboard.png";
  const caption = "All is Well";

  const chats = await client.getChats();
  const group = chats.find((chat) => chat.isGroup && chat.name === chatName);

  //whatsapp api
  if (group) {
    const media = await client.sendMessage(
      group.id._serialized,
      fs.readFileSync(filePath),
      { caption }
    );
    console.log("Screenshot sent to WhatsApp group!");
  } else {
    console.log("Group not found!");
  }
  client.destroy();
});

client.initialize();
