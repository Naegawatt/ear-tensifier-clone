const { blue, green, magentaBright } = require("colorette");
const { performance } = require("perf_hooks");
const { Collection } = require("discord.js");

module.exports = {
  execute: async (bot) => {
    bot.prefixes = {
      "": ";",
      "": ".",
      "": "",
    };

    bot.commands = new Collection();
    bot.cooldowns = {
      global: new Map(),
      ai: new Map(),
      changelog: new Map(),
      lyrics: new Map(),
      spotify: new Map(),
    };
    bot.aliases = new Collection();
    bot.slashCommands = new Collection();

    bot.proxies = {
      stable: true,
      main: {
        endpoint: undefined,
      },
      lavalink: {
        addr: undefined,
        port: 0,
      },
      canvas: {
        addr: "0.tcp.sa.ngrok.io",
        port: 15819,
      },
    };

    const start = performance.now();
    const fs = require("fs");
    const path = require("path");

    const refreshCommands = (firstTime = false) => {
      const prefix = fs.readdirSync(path.join(__dirname, "..", "Prefix"));
      for (let dir of prefix) {
        let commands = fs.readdirSync(
          path.join(__dirname, "..", "Prefix", dir),
        );
        for (let file of commands) {
          if (!file.endsWith(".js")) return;

          const filePath = path.join(__dirname, "..", "Prefix", dir, file);
          delete require.cache[require.resolve(filePath)];
          let pull = require(filePath);

          if (!pull.category) pull.category = dir;
          if (pull.name) {
            if (firstTime) console.log(green(`+ [${pull.name}.js]`));
            bot.commands.set(pull.name, pull);
          } else {
            if (firstTime)
              console.log(
                blue("Warn!") +
                  `the prefixed command ${file} does not have a declared name!`,
              );
            continue;
          }

          if (pull.aliases && Array.isArray(pull.aliases)) {
            for (let alias of pull.aliases) {
              bot.aliases.set(alias, pull.name);
            }
          }

          // Clean up the required module after use
          pull = null;
        }
      }

      if (firstTime)
        console.log(
          magentaBright(
            `Loaded ${bot.commands.size} prefixed commands in ${(
              performance.now() - start
            ).toFixed(4)}ms`,
          ),
        );

      const slash = fs.readdirSync(path.join(__dirname, "..", "Slash"));
      for (let dir of slash) {
        let slashCommands = fs.readdirSync(
          path.join(__dirname, "..", "Slash", dir),
        );
        for (let file of slashCommands) {
          if (!file.endsWith(".js")) return;

          const filePath = path.join(__dirname, "..", "Slash", dir, file);
          delete require.cache[require.resolve(filePath)];
          let pull = require(filePath);

          if (!pull.category) pull.category = dir;
          if (pull.name) {
            if (firstTime) console.log(magentaBright(`+ [${pull.name}.js]`));
            bot.slashCommands.set(pull.name, pull);
          } else {
            if (firstTime)
              console.log(
                blue("Warn!") +
                  `the slash command ${file} does not have a declared name!`,
              );
            continue;
          }

          if (pull.aliases && Array.isArray(pull.aliases)) {
            for (let alias of pull.aliases) {
              bot.aliases.set(alias, pull.name);
            }
          }

          // Clean up the required module after use
          pull = null;
        }
      }

      if (firstTime)
        console.log(
          green(
            `Loaded ${bot.slashCommands.size} slash commands in ${(
              performance.now() - start
            ).toFixed(4)}ms`,
          ),
        );
    };

    refreshCommands(true);

    const watchFiles = (dir) => {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        console.log(eventType);
        if (filename && filename.endsWith(".js")) {
          console.log(`File ${path.join(dir, filename)} has been modified`);
          refreshCommands();
        }
      });
    };

    const prefixDir = path.join(__dirname, "..", "Prefix");
    const slashDir = path.join(__dirname, "..", "Slash");

    watchFiles(prefixDir);
    watchFiles(slashDir);
  },
};
