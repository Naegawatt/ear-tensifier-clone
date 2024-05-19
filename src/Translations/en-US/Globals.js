
const colors = require("../../cogs/colors.js");

module.exports = (args) => ({
  Mention: {
    content: `<@${args?.id}>'s **Prefix in this Guild** is \`$\`  ·  **How to play** **\`$play\`** \`song\`\n<:p_volume:1241757262679113728> To experience music, you need to be in a voice channel.`
  }
});
