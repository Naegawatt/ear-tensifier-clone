const { blue, bold, green, magentaBright, yellow } = require("colorette");
const { performance } = require("perf_hooks");
const lang = require("../handlers/Language");

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(bot, message) {
    if (!message.guild) return;

    const player = bot.riffy.players.get(message.guild.id);
    if (player && player.playing && player.current) {
      if (!player.counter) player.counter = 0;
      player.counter = player.counter + 1;
      if (player.counter >= 12) {
        player.counter = 1;
        player.sendEmbed(player, player.current);
        player.msg.delete().catch(() => {});
      }
    }
    if (message.author.bot) return;
    if (!message.member) return;

    const start = performance.now();
    const { guildId } = message;

    const variables = {
      prefix: bot.prefixes[guildId] ? bot.prefixes[guildId] : "$",
      keyword: bot.user.username,
      mentions: {
        desktop: `<@${bot.user.id}>`,
        mobile: `<@!${bot.user.id}>`,
      },
      language: "en-US",
    };

    let t = lang.prepare(variables.language, "Globals").getString;

    if (
      message.content === `<@!${bot.user.id}>` ||
      message.content === `<@${bot.user.id}>`
    ) {
      return message.reply(t("Mention", { id: bot.user.id }, "Globals"));
    }

    let words = message.content.split(" ");
    const similarity =
      bot.utils.compareTwoStrings(words[0], variables.keyword) > 0.5;

    if (similarity) {
      words[0] = `<@${bot.user.id}>`;
      message.content = words.join(" ");
    }

    if (!message.content.toLowerCase().startsWith(variables.prefix)) {
      if (
        message.content.startsWith(variables.mentions.desktop) ||
        message.content.startsWith(variables.mentions.mobile) ||
        similarity
      ) {
        message.content = message.content
          .replace(variables.mentions.desktop + " ", variables.prefix)
          .replace(variables.mentions.mobile + " ", variables.prefix);
        words = message.content.split(" ");
      } else return;
    }

    let protectedCommands = [
      "play",
      "nowplaying",
      "queue",
      "join",
      "filters",
      "join",
      "disconnect",
    ];

    let args = words.slice(1);
    let cmd = words[0].slice(variables.prefix.length);

    console.log(cmd);

    let command =
      bot.commands.get(bot.aliases.get(cmd)) || bot.commands.get(cmd);

    if (!command) {
      let slashFallback =
        bot.slashCommands.get(cmd) ||
        bot.slashCommands.get(bot.aliases.get(cmd));
      if (slashFallback) {
        command = slashFallback;
        cmd = slashFallback.name;
        message.user = message.author;
        message.followUp = message.reply;
        message.deferReply = () => {};
        message.editReply = message.reply;

        if (protectedCommands.includes(command.name) || command.vote) {
          let { error, permission, notPlaying } = bot.utils.getConditions(
            bot,
            message,
            command.name,
          );

          if (error && !command.textChannel)
            return message.reply({ content: error, ephemeral: true });

          if (notPlaying && !command.textChannel)
            return message.reply({ content: notPlaying, ephemeral: true });

          if (command.dj && permission)
            return message.reply({ content: permission, ephemeral: true });
        }

        return command.run(
          t,
          message,
          bot,
          args,
          { region: variables.language, target: bot.utils.lang(command.name) },
          variables.prefix,
          args,
        );
      }
    } else {
      t = lang.prepare(variables.language, command.name).getString;
      message.user = message.author;
      message.followUp = message.reply;

      if (protectedCommands.includes(command.name) || command.vote) {
        let { error, permission, notPlaying } = bot.utils.getConditions(
          bot,
          message,
          command.name,
        );

        if (error && !command.textChannel)
          return message.reply({ content: error, ephemeral: true });

        if (notPlaying && !command.textChannel)
          return message.reply({ content: notPlaying, ephemeral: true });

        if (command.dj && permission)
          return message.reply({ content: permission, ephemeral: true });
      }

      command.run(
        t,
        message,
        bot,
        args,
        { region: variables.language, target: bot.utils.lang(command.name) },
        variables.prefix,
      );

      const end = performance.now();
      console.log(
        magentaBright(`Performance of`) +
          bold(green(` messageCreate: `)) +
          blue(`${end - start}ms`),
      );
    }
  },
};
