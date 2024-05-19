const { magenta, cyan } = require("colorette");
const { readdirSync, readFileSync } = require("fs");
const { join } = require("node:path");
module.exports = {
  execute: (bot) => {
    const figlet = readFileSync(join(__dirname, "..", "assets", "figlet.txt"), {
      encoding: "utf-8",
    });

    console.log(magenta(figlet.slice(0, 769)) + cyan(figlet.slice(769)));
    const files = readdirSync("./src/handlers").filter((x) =>
      ["Util", "Command", "Event", "Music"].includes(x.slice(0, -3))
    );

    for (let component of files) {
      require(join(__dirname, component)).execute(bot);
    }
  },
};
