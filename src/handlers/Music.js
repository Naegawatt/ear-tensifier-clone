const { yellow, green, blue, red } = require("colorette");
const { Client, GatewayDispatchEvents } = require("discord.js");
const { Riffy } = require("riffy");

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
  execute: async (bot) => {
    const nodes = [
      {
        host: "node.raidenbot.xyz",
        password: process.env.PASS,
        port: 5500,
        secure: false,
        name: "Ligma",
        autoResume: true,
        resumeTimeout: 240_000,
      },
    ];

    bot.riffy = new Riffy(bot, nodes, {
      send: (payload) => {
        const guild = bot.guilds.cache.get(payload.d.guild_id);
        if (guild) guild.shard.send(payload);
      },
      defaultSearchPlatform: "spsearch",
      restVersion: "v4",
    });

    bot.riffy.on("queueEnd", (player) => {
      player.autoplay(player);
    });

    bot.riffy.on("trackStart", async (player, track) => {
      player.sendEmbed = async (player, track) => {
        const guild = bot.guilds.cache.get(player.guildId);
        const channel = await bot.channels.fetch(player.textChannel);

        const generateButtons = (player, track) => {
          player.buttons = [
            {
              type: 2,
              style: 2,
              custom_id: "rewind",
              emoji: { id: "1241739128853495828" },
            },
            {
              type: 2,
              style: 2,
              custom_id: "seek_prev",
              emoji: { id: "1241739130489143418" },
            },
            {
              type: 2,
              style: player.paused ? 1 : 2,
              custom_id: "pause_play",
              emoji: {
                id: player.paused
                  ? "1241739132556808293"
                  : "1241757646579699772",
              },
            },
            {
              type: 2,
              style: 2,
              custom_id: "seek_next",
              emoji: { id: "1241739136625283132" },
            },
            {
              type: 2,
              style: 2,
              custom_id: "skip",
              emoji: { id: "1241739134276735117" },
            },
          ];
        };

        player.files = [
          {
            attachment: await bot.utils.getBuffer(
              "http://localhost:8192/api/v1/artwork?optimize=true&url=" +
                track.info.thumbnail
            ),
            contentType: "image/png",
            name: "artwork.png",
          },
        ];

        const generateEmbed = (player, track) => {
          player.embed = {
            author: {
              name: track.info.author,
              icon_url: "https://i.imgur.com/h4GLYja.png",
            },
            thumbnail: {
              url: "attachment://artwork.png",
            },
            title: "**" + track.info.title + "**",
            description: `${mmSs(player.position)} / ${mmSs(
              track.info.length
            )}`,
            color: parseInt("26272f", 16),
            footer: {
              text:
                track.info.requester.globalName ??
                track.info.requester.username,
              icon_url: track.info.requester.displayAvatarURL(),
            },
          };
        };

        const generateMsg = (player, track) => {
          generateButtons(player, track);
          generateEmbed(player, track);
          return {
            embeds: [player.embed],
            files: player.files,
            components: [
              {
                type: 1,
                components: player.buttons,
              },
            ],
          };
        };

        try {
          if (!player.nowplaying) player.nowplaying = [];

          channel.bulkDelete(player.nowplaying).catch();
          player.nowplaying = [];
        } catch (error) {
          //console.log(error);
          if (error.code !== 50013) {
            player.nowplaying = [];
            console.error(error);
          }
        }

        try {
          if (!player.nowplaying) player.nowplaying = [];

          player.nowplaying.forEach(async (msg) => {
            await msg.delete();
          });

          player.nowplaying.forEach(async (msg) => {
            channel.messages.fetch(msg.id).then((msg) => {
              msg.delete();
            });
          });
          player.nowplaying = [];
        } catch (error) {
          //console.log(error);
          if (error.code !== 50013) {
            player.nowplaying = [];
            console.error(error);
          }
        }

        player.msg = await channel.send(generateMsg(player, track));

        if (!player.nowplaying) {
          player.nowplaying = [];
        }

        /* Store */
        if (player.nowplaying && Array.isArray(player.nowplaying)) {
          player.nowplaying.push(player.msg);
        }

        if (!player.interval)
          player.interval = setInterval(() => {
            let p = bot.riffy.players.get(player.guildId);
            if (p && p.playing && p.msg) {
              if (p.current === track) p.msg.edit(generateMsg(p, p.current));
            }
          }, 10_000);

        const collector = player.msg.createMessageComponentCollector();

        collector.on("collect", async (i) => {
          const { error, permission, notPlaying } = bot.utils.getConditions(
            bot,
            i
          );

          if (error) return i.reply({ content: error, ephemeral: true });
          if (notPlaying)
            return i.reply({ content: notPlaying, ephemeral: true });

          if (
            ["seek_prev", "seek_next", "rewind", "skip"].includes(i.customId)
          ) {
            if (permission)
              return i.reply({ content: permission, ephemeral: true });
          }
          switch (i.customId) {
            case "pause_play":
              player.pause(player.paused ? false : true);
              i.update(generateMsg(player, track));
              break;
            case "seek_prev":
              player.seek(player.position - 15_000);
              i.update(generateMsg(player, track));
              break;
            case "seek_next":
              player.seek(player.position + 15_000);
              i.update(generateMsg(player, track));
              break;
            case "skip":
              //i.update(generateMsg(player, track));
              await player.msg.delete();
              player.stop();
              collector.emit("end");
              break;
            case "rewind":
              if (player.previous && player.position < 15_000) {
                i.update(generateMsg(player, track));
                player.queue.unshift(player.previous);
                player.stop();
                collector.emit("end");
              } else {
                player.seek(0);
                await i.update();
              }
              break;
          }
        });

        collector.once("end", async () => {
          player.msg
            .edit({
              embeds: [
                {
                  author: {
                    name:
                      track.info.requester.globalName ??
                      track.info.requester.username,
                    icon_url: track.info.requester.displayAvatarURL(),
                  },
                  color: parseInt("26272f", 16),
                  description: `Played **${track.info.title}** by **${track.info.author}**`,
                  thumbnail: {
                    url: "attachment://artwork.png",
                  },
                },
              ],
              components: [],
              files: [
                {
                  attachment: await bot.utils.getBuffer(
                    "http://localhost:8192/api/v1/artwork?zero=true&url=" +
                      track.info.thumbnail
                  ),
                  name: "artwork.png",
                  contentType: "image/png",
                },
              ],
            })
            .then((m) => {
              setTimeout(() => {
                m.delete();
              }, 3600000);
            });
        });
      };
      player.sendEmbed(player, track);
    });

    bot.riffy.on("trackEnd", (player) => {
      player.msg.delete().catch(() => {});
    });

    bot.riffy.on("nodeConnect", (node) => {
      console.log(
        yellow(`Music:`) + green(` ${node.name} `) + blue(`connected.`)
      );
    });

    bot.riffy.on("nodeError", (node, error) => {
      console.log(
        yellow(`Music:`) +
          green(` ${node.name} `) +
          red(`encountered an error.\n`) +
          error.message
      );
    });

    bot.on("raw", (d) => {
      if (
        ![
          GatewayDispatchEvents.VoiceStateUpdate,
          GatewayDispatchEvents.VoiceServerUpdate,
        ].includes(d.t)
      )
        return;
      bot.riffy.updateVoiceState(d);
    });
  },
};
