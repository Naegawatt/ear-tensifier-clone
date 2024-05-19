const colors = require("../../cogs/colors");
const { performance } = require("perf_hooks");

module.exports = {
  name: "disconnect",
  aliases: ["dc", "leave", "stop"],
  description: "(leave, dc, stop, disconnect...)",
  opts: {
    type: 1,
    name: "disconnect",
    description: "(leave, dc, stop, disconnect...)",
  },
  dj: true,
  run: async (t, interaction, bot) => {
    const player = bot.riffy.players.get(interaction.guildId);
    if (!player || !player.current || (!player.playing && !player.paused))
      return interaction.reply({
        content: t("NoPlayer", {}, "Faults"),
        ephemeral: true
      });

    player.disconnect();
    player.destroy();

    interaction.reply(`<:perry_check:1241739138647064656> Left the voice channel.`)
  },
};