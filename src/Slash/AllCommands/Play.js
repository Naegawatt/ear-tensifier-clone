const colors = require("../../cogs/colors");
const { performance } = require("perf_hooks");

const mmSs = (duration) => {
  let milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return minutes + ":" + seconds;
};

module.exports = {
  name: "play",
  aliases: ["p", "add", "pl", "put"],
  description: "Play a track, playlist or a file.",
  opts: {
    type: 1,
    name: "play",
    description: "Play a track, playlist or a file.",
    options: [
      {
        type: 3,
        name: "query",
        description: "Title (or URL) of the song(s) that you love:",
        required: true,
        autocomplete: false,
      },
    ],
  },
  run: async (t, interaction, bot, oldArgs, locale, prefix, args) => {
    await interaction.deferReply();
    const query = args
      ? args.join(" ")
      : interaction.options.getString("query");

    const player = bot.riffy.createConnection({
      guildId: interaction.guild.id,
      voiceChannel: interaction.member.voice.channel.id,
      textChannel: interaction.channelId,
      deaf: true,
    });

    const resolve = await bot.riffy.resolve({
      query: query,
      requester: interaction.user,
    });
    const { loadType, tracks, playlistInfo } = resolve;

    if (loadType === "playlist") {
      for (const track of resolve.tracks) {
        track.info.requester = interaction.user;
        player.queue.add(track);
      }

      interaction.followUp(
        `<:perry_check:1241739138647064656> Queued ${playlistInfo?.name || ''} (${tracks.length} tracks)`,
      );
      if (!player.playing && !player.paused) return player.play();
    } else if (loadType === "search" || loadType === "track") {
      const track = tracks.shift();
      track.info.requester = interaction.user;

      player.queue.add(track);
      interaction.followUp(`<:perry_check:1241739138647064656> Queued \`${track.info.title}\` [${mmSs(track.info.length)}]`);
      if (!player.playing && !player.paused) return player.play();
    } else {
      return interaction.followUp("There are no results found.");
    }
  },
};
