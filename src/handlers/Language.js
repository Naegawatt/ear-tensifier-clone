const { existsSync, unlinkSync } = require("fs");
const { join } = require("node:path");
module.exports = {
  prepare(folder, file) {
    return {
      getString: (target, args = {}, source = null) => {
        const failsafe = () => {
          const filePath = join(
            __dirname,
            "..",
            "Translations",
            folder,
            file + ".js",
          );

          if (existsSync(filePath)) {
            // Delete the file if it exists
            if (folder !== "en-US") unlinkSync(filePath);
          }

          let fallPath = join(
            __dirname,
            "..",
            "Translations",
            "en-US",
            `${file}.js`,
          );
          if (existsSync(fallPath))
            return require(fallPath)(args || {})[target];
          else return null;
        };
        try {
          if (source) file = source;
          if (
            existsSync(
              join(__dirname, "..", "Translations", folder, file + ".js"),
            )
          ) {
            let i = require(
              join(
                __dirname,
                "..",
                "Translations",
                folder || "en-US",
                `${file}.js`,
              ),
            )(args || {})[target];
            delete require.cache[
              require.resolve(
                join(__dirname, "..", "Translations", folder, `${file}.js`),
              )
            ];
            if (!i) return failsafe();
            else return i;
          } else return failsafe();
        } catch (error) {
          console.log(error);
          return failsafe();
        }
      },
    };
  },
};
