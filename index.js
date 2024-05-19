/* THIS ROBOT WAS MADE FOR SANITY. AS A FREE TO USE ROBOT, YOU MAY NOT USE THIS CODE WITHOUT GIVING ME CREDITS. IF YOU PAID FOR THIS CODE, YOU MAY HAVE BEEN SCAMMED =( 
CONTACT ME AT @GABCAUA OR @LISTEN.CREATORS OR AT WWW.LISTEN.CGSILVA.COM.BR OR
AT CONTATO@CGSILVA.COM.BR (E-MAIL). PLEASE, HAVE CAUTION PROCEEDING WITH THIS CODE. 
--> EXPIRATION DATE: 2025 - MUSIC BOTS NEED CONSTANT MAINTENANCE <-- */

/* Conseguir variáveis de ambiente. */
require("dotenv").config();

const { join } = require("node:path");
const { Client, Options } = require("discord.js");

const intents = [
  "Guilds",
  "GuildVoiceStates",
  "GuildMessages",
  "MessageContent",
];

const bot = new Client({
  messageCacheLifetime: 540,
  fetchAllMembers: false,
  intents,
  makeCache: Options.cacheWithLimits({
    PresenceManager: {
      maxSize: 0,
    },
    AutoModerationRuleManager: 0,
    BaseGuildEmojiManager: 0,
    DMMessageManager: 0,
    GuildBanManager: 0,
    GuildEmojiManager: 0,
    GuildForumThreadManager: 0,
    GuildInviteManager: 0,
    GuildStickerManager: 0,
    GuildTextThreadManager: 0,
    MessageManager: 0,
    ReactionUserManager: 0,
    ReactionManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    WebhookManager: 0,
    WebhookMessageManager: 0,
    WebhookClient: 0,
    ApplicationCommandManager: 0,
    ApplicationCommandPermissionsManager: 0,
    ApplicationCommandInteractionManager: 0,
    ApplicationCommandInteractionOptionManager: 0,
    ApplicationCommandInteractionSubcommandManager: 0,
    ApplicationCommandInteractionSubcommandGroupManager: 0,
    ApplicationCommandInteractionSubcommandOptionManager: 0,
    ApplicationCommandInteractionSubcommandGroupOptionManager: 0,
    ApplicationCommandInteractionSubcommandGroupOptionValueManager: 0,
    ApplicationCommandInteractionSubcommandOptionValueManager: 0,
    ApplicationCommandInteractionSubcommandGroupOptionValueManager: 0,
  }),
  allowedMentions: {
    repliedUser: true,
  },
  failIfNotExists: false,
  sweepers: {
    users: {
      interval: 96_000,
      filter: (u) =>
        ![
          bot.user.id,
        ].includes(u.id),
    },
    messages: {
      interval: 120_000,
      filter: (m) =>
        ![
          bot.user.id,
        ].includes(m.author.id),
    },
  },
  waitGuildTimeout: 30_000,
  closeTimeout: 30_000,
  ws: { large_threshold: 250, version: 10 },
  presence: {
    status: "idle"
  }
});

/* Start Components */
require(join(__dirname, "src", "handlers", "Component.js")).execute(bot);

bot.login(process.env.TOKEN);

/* Express Server for the Weariful API. */

const express = require("express");
const app = express();
const port = 8192;

app.use(express.json());
app.listen(port, () => console.log(`Listening on port ${port}`));

app.get("/", (req, res) => {
  res.send("Listen.js");
});

const { createCanvas, loadImage } = require("@napi-rs/canvas");

app.get("/api/v1/artwork", async (req, res) => {
  const { url, optimize = "false", minimal = "false" } = req.query;
  const widthHeight = minimal === "true" ? 42 : optimize === "true" ? 320 : 640;
  // We use 640 as the default width and height for the thumbnails, but if the user wants to optimize the image, we use 320x320 instead.

  if (!url) {
    return res.status(400).json({ error: "URL parameter is missing" });
  }

  try {
    const image = await loadImage(url);
    const canvas = createCanvas(widthHeight, widthHeight);
    const ctx = canvas.getContext("2d");

    // Calculate scaling factors for width and height
    const widthScaleFactor = widthHeight / image.width;
    const heightScaleFactor = widthHeight / image.height;
    let scaleFactor = Math.max(widthScaleFactor, heightScaleFactor);

    // Calculate scaled dimensions
    const scaledWidth = image.width * scaleFactor;
    const scaledHeight = image.height * scaleFactor;

    // Calculate position to center the image
    const offsetX = (widthHeight - scaledWidth) / 2;
    const offsetY = (widthHeight - scaledHeight) / 2;

    // Draw the image centered and covering the canvas
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    const jpegData = await canvas.encode("jpeg", {
      speed: 10,
      threads: 0,
      alphaQuality: 90,
      chromaSubsampling: true,
    });

    res.set("Content-Type", "image/jpeg");
    res.send(jpegData);
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
