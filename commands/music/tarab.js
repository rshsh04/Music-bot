// tarab.js

const { QueryType, useMainPlayer } = require('discord-player');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { Translate } = require('../../process_tools');

module.exports = {
  name: 'tarab',
  description: 'Play pre-saved YouTube playlists',
  voiceChannel: true,

  async execute({ inter, client }) {
    try {
      const player = useMainPlayer();

      const link = 'https://youtube.com/playlist?list=PLrtIAjuNl0ARuGHtPntd90OsOCv9N60M-&si=u2B3EX0bjl--uL1n';
      const res = await player.search(link, {
        requestedBy: inter.member,
        searchEngine: QueryType.AUTO
      });

      let defaultEmbed = new EmbedBuilder().setColor('#2f3136');

      if (!res?.tracks.length) {
        defaultEmbed.setAuthor({ name: await Translate(`No results found... try again ? <❌>`) });
        return inter.editReply({ embeds: [defaultEmbed] });
      }

      // Shuffle the playlist
      const shuffledTracks = res.tracks.sort(() => Math.random() - 0.5);

      // Play the shuffled playlist
      for (const track of shuffledTracks) {
        await player.play(inter.member.voice.channel, track.url, {
          nodeOptions: {
            metadata: {
              channel: inter.channel
            },
            volume: client.config.opt.volume,
            leaveOnEmpty: client.config.opt.leaveOnEmpty,
            leaveOnEmptyCooldown: client.config.opt.leaveOnEmptyCooldown,
            leaveOnEnd: client.config.opt.leaveOnEnd,
            leaveOnEndCooldown: client.config.opt.leaveOnEndCooldown,
          }
        });

        // Set the embed to show the current track
        defaultEmbed.setAuthor({ name: await Translate(`Loading <${track.title}> to the queue... <✅>`) });
        await inter.editReply({ embeds: [defaultEmbed] });
      }

      // Loop the whole playlist
      player.setRepeatMode({
        repeatMode: 1, // 1 = loop whole playlist
        repeatCount: Infinity
      });
    } catch (error) {
      console.error(`Error playing tarab: ${error}`);
      const defaultEmbed = new EmbedBuilder().setColor('#2f3136');
      defaultEmbed.setAuthor({ name: await Translate(`Error playing tarab... try again ? <❌>`) });
      await inter.editReply({ embeds: [defaultEmbed] });
    }
  }
};