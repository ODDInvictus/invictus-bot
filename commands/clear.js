const settings = require('../settings.json');

module.exports = {
    name: 'clear',
    description: 'Gooit alle slechte muziek uit de queue',
    args: false,
    usage: `${settings.prefix}clear`,
    execute: (msg, args, client) => {
        console.log(`Clearing ${msg.guild.id}'s queue`);
        msg.reply('doeg slechte muziek');
        client.queue[msg.guild.id] = [];
    }
}