const fs = require('fs');
const settings = require('./settings.json');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('message', msg => {
    if (msg.author.bot) return; // Sender is the bot

    if (msg.channel.id == settings.channelID) return; // Quote chnnel

    console.log(msg);

    //Leuke grapjes

    if (msg.content.toLowerCase().includes('wat')) {
        msg.reply('patat🍟');
        return;
    }

    if (msg.content.toLowerCase().includes('hoezo')) {
        msg.reply('ouzo!🍾');
        return;
    }

    if (msg.content.toLowerCase().includes('invictus')) {
        msg.reply("'vo");
        return;
    }

    if (msg.content.toLowerCase().includes('das mooi')) {
        msg.react(msg.guild.emojis.cache.get(settings.dasmooiID))
            .catch((err) => console.log(err));
        return;
    }

    if (msg.content.toLowerCase().includes('pollo')) {
        msg.react(msg.guild.emojis.cache.get(settings.polloID))
            .catch((err) => console.log(err));
        return;
    }

    //Commands

    if (!msg.content.startsWith(settings.prefix)) return; // If not a command

    const args = msg.content.slice(settings.prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    if (!client.commands.has(cmdName)) return; // Command does not exist

    const cmd = client.commands.get(cmdName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

    if (!cmd) return;

    if (cmd.args && !args.length || args.length > cmd.args_length) {
        return msg.reply(`ik mis een aantal argumenten. ${cmd.usage}`);
    }

    try {
        cmd.execute(msg, args, client);
    } catch (error) {
        console.error(error);
        msg.reply('lekker bezig, bot is stuk');
    }
});


// Login and initialize
client.on('ready', () => {
    client.commands = new Discord.Collection();
    client.queue = new Map();
    client.dispatchers = new Map();

    fs.readdirSync('./commands').filter(file => file.endsWith('.js')).forEach(file => {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    });
    console.log(`Logged in as ${client.user.tag}`);
});


// API
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/quote', (req, res) => {
    console.log('Request on route /quote');

    const channel = client.channels.cache.get(settings.channelID);

    channel.messages.fetch({ limit: 100 }).then(messages => {
        //Iterate through the messages here with the variable "messages".
        ihavesend = false;
        messages.forEach(message => {
            if (ihavesend) return;

            if (Math.random() < 0.1) {
                res.json({quote: message.content});
                ihavesend = true;
            } 
        });
        if (!ihavesend) {
            res.json({quote: "wie dit leest trekt bak -Das tijdens het maken van de bot (kans op dit bericht is 1 / 10^100)"});
        }
      });
});

const run = async () => {
    await client.login(settings.token);
    app.listen(settings.PORT);
    console.log('Listening on port ' + settings.PORT);
}

run();