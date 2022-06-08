const settings = require('../settings.json');
const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'voor mensen die niet alles weten over de niebot',
    args: false,
    usage: `${settings.prefix}help`,
    execute: async (msg, args, client) => {
        let message = '';
        client.commands.forEach(cmd => {
            message += `${cmd.name}: ${cmd.description}\n`
            message += `­­ _ _ _ _ ${cmd.usage} \n`
        })
        msg.channel.send(
            new Discord.MessageEmbed()
                .setColor('#0099ff')
                .addField('commands', message)
                .setTimestamp()
        )
    }
}