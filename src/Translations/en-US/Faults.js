const colors = require("../../cogs/colors.js");

module.exports = (args) => ({
  PleaseJoinVoiceChannel:
    "You need to be in a voice channel to use this command.",
  NoMusicPlaying: "There's no music playing right now.",
  DiffVoiceChannel:
    "You need to be in the same voice channel as the bot to use this command.",
  NoPlayer: "There's no music playing in this server.",
  NotPrivileged:
    "To be able to perform queue operations without DJ or privileged roles, you need to be in a voice channel with a maximum of 3 listeners.\n- **DJ:** means to have a role called **DJ** to use this command.\n- **Privileged Roles:** means to have at least one of the following permissions to use this command: **Administrator**, **Moderator** **Mute Members**, **Manage Guild**.",
  NoAdmin: {
    title: "You can't do that.",
    description: "Only admins can use this.",
    color: colors.redBrick,
  },
});