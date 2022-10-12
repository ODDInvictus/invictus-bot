const settings = require('../settings.json');
const Discord = require('discord.js');
var AsciiTable = require('ascii-table');

module.exports = {
    name: 'help',
    description: 'voor mensen die niet alles weten over de niebot',
    args: false,
    usage: `${settings.prefix}help`,
    execute: async (msg, args, client) => {
        let message = '';
		let table = new AsciiTable("Commando's")
						table.setHeading('Module', 'Opties')
        client.commands.forEach(cmd => {
			// we might have to split this up into multiple messages
			

			if (typeof cmd.usage === "string") {
				table.addRow(`*${cmd.name}*`, `${cmd.usage}`)
				table.addRow('', `${cmd.description}`)
			} else {
				// type is array
				let i = 0;
				cmd.usage.forEach(usage => {
					if (i === 0) {
						table.addRow(`*${cmd.name}*`, `${usage.cmd}`)
					} else {
						table.addRow('', `${usage.cmd}`)
					}
					table.addRow('', `${usage.desc}`)
					i++;
				})
			}
        })
		// fuck it, go split this stuff up on your own time >:)
        msg.channel.send(`\`\`\`md\n${table.toString()}\n\`\`\``)
    }
}