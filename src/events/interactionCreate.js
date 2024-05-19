const { blue, bold, green, magentaBright } = require("colorette");
const { performance } = require("perf_hooks");
const lang = require("../handlers/Language");

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(bot, interaction) {
    const start = performance.now();
    const { guildId, commandName } = interaction;

    const variables = {
      prefix: bot.prefixes[guildId] ?? "$",
      language: "en-US",
    };

    /* Slash Commands: */
    if (interaction.type === 2) {
      const command = bot.slashCommands.get(commandName);
      console.log(command);
      /* Checking for Permissions using Permissions Handler */
      if (
        [
          "play",
          "nowplaying",
          "queue",
          "join",
          "filters",
          "join",
          "disconnect",
          "lyrics",
        ].includes(commandName) ||
        command.vote
      ) {
        let { error, permission, notPlaying } = bot.utils.getConditions(
          bot,
          interaction,
          commandName,
        );
        if (error && !command.textChannel)
          return interaction.reply({ content: error, ephemeral: true });

        if (notPlaying && !command.textChannel)
          return interaction.reply({ content: notPlaying, ephemeral: true });

        if (command.dj && permission)
          return interaction.reply({ content: permission, ephemeral: true });

        const t = lang.prepare(
          variables.language,
          bot.utils.lang(commandName ?? "Globals"),
        ).getString;

        command.run(
          t,
          interaction,
          bot,
          { region: variables.language, target: commandName },
          variables.prefix,
          "", // args
        );
      }
    }

    const end = performance.now();
    console.log(
      magentaBright(`Performance of`) +
        bold(green(` interactionCreate: `)) +
        blue(`${end - start}ms`),
    );
  },
};
