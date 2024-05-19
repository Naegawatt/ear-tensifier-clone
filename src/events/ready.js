
const { yellow, green, bold, blue } = require("colorette");
const { Routes } = require("discord-api-types/v10");
const { REST } = require("@discordjs/rest");
module.exports = {
  name: "ready",
  once: true,
  execute(bot) {
    /* bot.riffy.init(bot.user.id); */
    const used = process.memoryUsage();

    for (let key in used) {
      console.log(
        `${key} using approx. ${
          Math.round((used[key] / 1024 / 1024) * 100) / 100
        } MB`
      );
    }

    console.log(
      yellow(`Connected! `) + green(`${bot.user.tag} (${bot.user.id})`)
    );

    const commands = Array();
    const map = Array.from(bot.slashCommands);
    for (let command of Object(map)) {
      command = command[1].opts;
      if (!command.subCommand) commands.push(command);
    }

    const rest = new REST({ version: "10" }).setToken(bot.token);

    rest
      .put(Routes.applicationCommands(bot.user.id), {
        body: commands,
      })
      .then(() => {
        bot.application.commands.fetch().then((cache) => {
          bot.application.commands.cache = cache;
        });

        console.log(
          yellow(`[I/O] Slash Upsert: `) +
            bold(blue(`${commands.length}`)) +
            blue(` commands.`)
        );
      });

    const setStatus = () => {
      bot.user.setPresence({
        status: "idle",
        afk: true,
        /*activities: [
          {
            name: `HIT ME HARD AND SOFT`,
            details: "CHIHIRO",
            url: "https://top.gg/bot/777401960793636934",
            state: "Billie Eilish",
            assets: {
              large_image:
                "https://i.scdn.co/image/ab67616d00001e0271d62ea7ea8a5be92d3c1f62",
              small_image:
                "https://i.scdn.co/image/ab67616d00001e0271d62ea7ea8a5be92d3c1f62",
            },
            type: 2,
          },
        ],*/
      });
    };

    setStatus();
    setTimeout(() => setStatus(), 80_000);

    bot.riffy.init(bot.user.id)
    return;
  },
};
