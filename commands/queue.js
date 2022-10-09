const queue = require('../utils/queue');
const settings = require('../settings.json');
const youtube = require('./youtube');
const voice = require('../utils/voice');

const types = [
    'playlist',
    'youtube',
    'mp3'
]
const usage = `${settings.prefix}queue <youtube | mp3 | playlist> <link>`

module.exports = {
    name: 'queue',
    description: 'Voegt een nummer toe aan de queue',
    args: true,
    args_length: 2,
    usage: usage,
    execute: async (msg, args, client) => {
        if (!types.includes(args[0])) return msg.reply(usage);
        
        let first = undefined;

        if (args[0] === 'playlist') {
            first = await queue.queuePlaylist(args[1], msg.author.id, msg.guild.id, client);
        } else {
            first = await queue.queue(args[0], args[1], msg.author.id, msg.guild.id, client);
        }

        if (!voice.playing(msg, client)) {
            client.queue[msg.guild.id].shift(); // Remove first from queue
            await youtube.execute(msg, [first.link], client);
        }
    }
}