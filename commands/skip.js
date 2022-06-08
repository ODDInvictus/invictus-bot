const settings = require('../settings.json');
const youtube = require('./youtube');
const queue = require('../utils/queue');
const voice = require('../utils/voice');

module.exports = {
    name: 'skip',
    description: 'skipt het nummer voor als je laf bent',
    args: false,
    usage: `${settings.prefix}skip`,
    execute: async (msg, args, client) => {
        queue.getAndRemoveFirst(msg.guild.id, client)
            .then(async song => await youtube.execute(msg, [song.link] , client))
            .catch(async err => {
                await msg.channel.send(err);
                await voice.leave(msg);
            });
    }
}