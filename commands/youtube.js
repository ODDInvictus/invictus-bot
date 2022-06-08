const ytdl = require('ytdl-core-discord');
const voice = require('../utils/voice');
const queue = require('../utils/queue');
const settings = require('../settings.json');
const youtube = require('../utils/youtube');

module.exports = {
    name: 'youtube',
    description: 'Speelt een nummer af van youtube',
    args: true,
    args_length: 1,
    usage: `${settings.prefix}youtube <YOUTUBE LINK> [repeat]`,
    //TODO random oofs in vc
    execute: async (msg, args, client, previousSong) => { 
        youtube.getPlaylist('https://www.youtube.com/playlist?list=PLPCszAEiaMsKjwrBKV-xxxANuiOxqvisO');
        const conn = await voice.join(msg);
        let music = previousSong ? undefined : previousSong;
        let repeat = args[1] ? true : false
        let guild = msg.guild.id;

        youtube.getTitleFromVideo(args[0])
            .then(name => {
                client.user.setPresence({ activity: { name: name } })
                    .catch(console.error);
        })

        if (!music) {
            await ytdl(args[0], { quality: 'highestaudio' })
                .then(song => music = song)
                .catch(err => msg.channel.send('Dat is niet een youtube video'))
        }

        const dispatcher = conn.play(music, { type: 'opus' });
        client.dispatchers[guild] = dispatcher;

        dispatcher.on('finish', async () => {
            if (repeat) {
                this.execute(msg, args, client, music);
            } else {
                await queue.getAndRemoveFirst(guild, client)
                    .then(song => module.exports.execute(msg, [song.link], client))
                    .catch(err => voice.finish(msg, dispatcher));
            }
        })
    }
}