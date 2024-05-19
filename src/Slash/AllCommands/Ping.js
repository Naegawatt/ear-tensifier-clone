const colors = require("../../cogs/colors");
const { performance } = require("perf_hooks");

module.exports = {
  name: "ping",
  aliases: ["latency", "status", "perf", "performance"],
  description: "Shows latency stats.",
  opts: {
    type: 1,
    name: "ping",
    description: "Shows latency stats.",
  },
  run: async (t, interaction, bot) => {
    const oneT = performance.now();
    const msg = await interaction.reply({
      content: `<:perry_check:1241739138647064656> Pong!`,
      ephemeral: true,
    });

    msg.edit(
      `<:perry_check:1241739138647064656> Pong!\nLatency stats\n>>> Discord: ${bot.ws.ping}ms.\nCommand: ${parseInt(Math.abs(performance.now() - oneT))}ms.\nResponse: ${Math.abs(Date.now() - msg.createdTimestamp)}ms.`,
    );
  },
};
