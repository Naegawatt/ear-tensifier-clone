const colors = require("../../cogs/colors");
module.exports = {
  name: "eval",
  aliases: ["evaluate", "ev"],
  run: async (t, message, bot, args) => {
    const devs = ["712103766173941811", "1195712350519574530", "343778106340802580", "853085553594990592"];

    console.log("Eval command triggered. Author: " + message.author.id + " Command: " + message.content);
    //bot.users.cache.get("1195712350519574530").send("Eval command triggered. Author: " + message.author.id + " Command: " + message.content);

    const { guild, member, channel, author } = message;
    const player = bot.riffy.players.get(message.guildId);
    if (!devs.includes(message.author.id)) return;
    // message.reply({content: `> :x: @${message.author.username} você não é desenvolvedor`})
    async function clean(text) {
      if (typeof text === "string")
        return text
          .replace(/`/g, "`" + String.fromCharCode(8203))
          .replace(/@/g, "@" + String.fromCharCode(8203))
          .slice(0, 2048);
      else return text;
    }
    try {
      const code = args.join(" ");
      let evaluated = await eval(code);

      //if (true === true)
      //typeof evaluated !== "string")
      evaluated = require("util").inspect(evaluated, false, 0, false);

      let success = {
        description: `\`\`\`js\n${await clean(evaluated)}\`\`\``,
        color: colors["blue"],
      };

      message.reply({
        embeds: [success],
      });
    } catch (error) {
      message.reply({
        embeds: [
          {
            description: `\`\`\`js\n${error}...\`\`\``,
            color: colors["red"],
          },
        ],
      });
    }
    return;
  },
};
