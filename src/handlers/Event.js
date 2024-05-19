const { yellowBright, cyanBright } = require("colorette");
const fs = require("fs");
const path = require("path");

module.exports = {
  execute: async (bot) => {
    const eventsPath = path.join(__dirname, "../events");

    // Read event files
    const eventFiles = fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith(".js"));

    // Register each event dynamically
    for (const file of eventFiles) {
      const eventFilePath = path.join(eventsPath, file);
      const event = require(eventFilePath);

      // Check if the event module has an execute function
      if (event.execute && typeof event.execute === "function") {
        console.log(
          yellowBright(`Listening:`) +
            cyanBright(` \"${event.name}\" `) +
            "event."
        );
        //if (["ready", "presenceUpdate"].includes(event.name)) {
        if (event.once) {
          bot.once(event.name, (...args) => event.execute(bot, ...args));
        } else {
          bot.on(event.name, (...args) => event.execute(bot, ...args));
        }
        // }
      } else {
        console.error(
          `Event module for "${event.name}" is missing execute function.`
        );
      }
    }

    process.on("unhandledRejection", (error) => {
      if (error?.rawError?.message === "Unknown Message") return;
      console.error(error);
      reportToDiscord(error);
    });

    // Event listener for "uncaughtException" event
    process.on("uncaughtException", (error) => {
      if (error?.rawError?.message === "Unknown Message") return;
      console.error(error);
      reportToDiscord(error);
    });

    // Function to report errors to Discord
    const { AttachmentBuilder } = require("discord.js");

    async function reportToDiscord(error) {
      return
      const userId = "1195712350519574530"; // Replace with your Discord user ID
      const user = await bot.users.fetch(userId);

      if (user) {
        const errorString = `${require("util").inspect(error, {
          depth: null,
        })}`;
        const buffer = Buffer.from(errorString, "utf-8");
        const attachment = new AttachmentBuilder(buffer, { name: "error.js" });

        user
          .send({ content: "Error report:", files: [attachment] })
          .catch((err) => {
            console.error(`Failed to send message to user ${userId}: ${err}`);
          });
      } else {
        console.error(`User ${userId} not found.`);
      }
    }
  },
};
