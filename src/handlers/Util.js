const { getConditions } = require("../handlers/Permissions.js");
const { distance, closest } = require("fastest-levenshtein");

module.exports = {
  async execute(bot) {
    bot.utils = {
      compareTwoStrings,
      getConditions,
      getBuffer,
      lang,
    };

    function compareTwoStrings(str1, str2) {
      const editDistance = distance(str1, str2);

      if (editDistance === 0) return 1;

      const maxLength = Math.max(str1.length, str2.length);
      const normalized = 1 - editDistance / maxLength;

      return normalized;
    }

    function lang(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    async function getBuffer(url) {
      try {
        const arrayBuffer = await (
          await fetch(url, {
            /* add retries */
            method: "GET",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            },
            cache: "force-cache",
            redirect: "follow",
            signal: AbortSignal.timeout(17500),
          })
        ).arrayBuffer();
        return Buffer.from(arrayBuffer).length < 512
          ? await (
              await fetch("https://i.imgur.com/edmMdni.jpeg")
            ).arrayBuffer()
          : Buffer.from(arrayBuffer);
      } catch (error) {
        console.error(error);
        return "https://i.imgur.com/edmMdni.jpeg";
      }
    }
  },
};
