const colors = require("../../cogs/colors");
const { performance } = require("perf_hooks");

module.exports = {
  name: "lyrics",
  aliases: ["lrc", "letras", "ly", "l"],
  description: "Shows the lyrics.",
  opts: {
    type: 1,
    name: "lyrics",
    description: "Shows the lyrics.",
  },
  run: async (t, interaction, bot) => {
    await interaction.deferReply({
      ephemeral: true
    });
    
    const player = bot.riffy.players.get(interaction.guildId);
    if (!player || !player.current || (!player.playing && !player.paused))
      return interaction.reply({
        content: t("NoPlayer", {}, "Faults"),
        ephemeral: true
      })

    const songlyrics = require("songlyrics").default;
    const Buscar = require("lyria-npm");
    const fetchLyrics = require("fetch-lyrics").getLyrics;
    const lyricsFinder = require("lyrics-finder");

    const query = `${player.current.info.title} ${player.current.info.author}`;

    const promises = [
      songlyrics(query).catch(error => null), // Catch error and return null
      Buscar(query).catch(error => null),       // Catch error and return null
      fetchLyrics(query).catch(error => null), // Catch error and return null
      lyricsFinder(query).catch(error => null),  // Catch error and return null
    ];

    const results = await Promise.allSettled(promises); // Use Promise.allSettled

    let lrc = "";
    results.forEach(result => {
      if (result.value) { // Check for fulfilled promises
        let lyrics = result.value
        if (lyrics.lyrics) lrc = lyrics.lyrics;
        if (lyrics.letra) lrc = lyrics.letra[0];
        if (typeof lyrics === "string") lrc = lyrics;
      } 
    });

    if (lrc === "") {
      // Handle case where no lyrics are found
      lrc = "Lyrics Not Found!" // Use a placeholder or translation
    }

    interaction.followUp({
      embeds: [
        {
          color: parseInt("26272f", 16),
          description: lrc,
        },
      ],
      ephemeral: true,
    });
  },
};