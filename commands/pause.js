const settings = require('../settings.json');

module.exports = {
    name: 'pause',
    description: 'Pauzeert de herrie',
    aliases: ['speel'],
    args: false,
    usage: `${settings.prefix}resume`,
    execute: async (msg, args, client) => {
        msg.reply('kdoe m op pause hoor')
        client.dispatchers[msg.guild.id].pause();
    }
}