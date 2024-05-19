const lang = require("../handlers/Language");
module.exports = {
  getConditions: (bot, ctx, cmd = "") => {
    const { compareTwoStrings } = bot.utils;
    const { guild, member } = ctx;
    const { me } = guild.members;
    const player = bot.riffy.players.get(guild.id);
    const variables = {
      language: "en-US",
    };

    const t = lang.prepare(variables.language, "Faults").getString;

    const getFaults = () => {
      /* User is NOT in a Voice Channel) */
      if (!member.voice.channel) return t("PleaseJoinVoiceChannel");

      /* Bot is in a Voice Channel */
      if (me.voice.channel) {
        if (member.voice.channelId !== me.voice.channelId) {
          return t("DiffVoiceChannel");
        }
      }

      return;
    };

    const getDJ = () => {
      try {
        let voiceChannel = me.voice.channel;
        /* Search for DJ role */
        if (
          member.roles.cache.filter(
            (r) => compareTwoStrings("dj", r.name.toLowerCase()) >= 0.25,
          ).size > 0
        )
          return false;

        /* Check for privileged permissions, like administrator */
        let privileged;
        for (let permission of member.permissions.toArray()) {
          if (
            [
              "MuteMembers",
              "DeafenMembers",
              "MoveMembers",
              "ManageGuild",
              "Administrator",
              "ModerateMembers",
            ].includes(permission)
          ) {
            privileged = true;
            break;
          } else continue;
        }

        if (privileged) return false;

        /* Check if the voice channel is a small group */
        if (
          voiceChannel &&
          voiceChannel.members.filter((x) => !x.user.bot).size <= 3
        )
          return false;

        /* Check if the member is the requester of the current track 
        if (player.current && player.current.info.requester.id === member.id)
          return true; */

        /* If none of these conditions are met, return false */
        return t("NotPrivileged");
      } catch (error) {
        console.log(error);
        return;
      }
    };

    const getPlayer = () => {
      if (cmd == "play" || cmd == "join") return;

      if (!player) return t("NoPlayer");
      if (!player.current || (!player.playing && !player.paused))
        return t("NoPlayer");
      return;
    };

    return {
      error: getFaults(),
      permission: getDJ(),
      notPlaying: getPlayer(),
    };
  },
};
