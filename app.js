const fs = require('fs');
const settings = require('./settings.json');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('message', msg => {
    if (msg.author.bot) return; // Sender is the bot
    if (msg.channel.id == settings.channelID) return; // Quote chnnel

    //Leuke grapjes
    if (msg.content.search(/\bwat\b/gi) > -1) {
        msg.reply('Patat🍟');
        return;
    }

    if (msg.content.search(/\bhoezo\b/gi) > -1) {
        msg.reply('Ouzo!🍾');
        return;
    }

    if (msg.content.search(/\binvictus\b/gi) > -1) {
        msg.reply("'vo");
        return;
    }

    if (msg.content.search(/\bja ?ja\b/gi) > -1) {
        msg.reply("Ding dong⏰");
        return;
    }

    if (msg.content.search(/\bik stel voor\b/gi) > -1) {
        msg.reply("Je stelt helemaal niks voor.");
        return;
    }

    if (msg.content.search(/\bbouwkavel/gi) > -1) {
        msg.reply("Stroopwafel!🍾");
        return;
    }

    if (msg.content.search(/\bdas mooi\b/gi) > -1) {
        msg.react(msg.guild.emojis.cache.get(settings.dasmooiID))
            .catch((err) => console.log(err));
        return;
    }

    if (msg.content.search(/\bpollo\b/gi) > -1) {
        msg.react(msg.guild.emojis.cache.get(settings.polloID))
            .catch((err) => console.log(err));
        return;
    }

    //Commands
    if (!msg.content.startsWith(settings.prefix)) return; // If not a command

    const args = msg.content.slice(settings.prefix.length).trim().split(/ +/);
    let cmdName = args.shift().toLowerCase();
    cmdName = cmdName === 'sb' ? 'strafbakken' : cmdName;
    if (!client.commands.has(cmdName)) return; // Command does not exist

    const cmd = client.commands.get(cmdName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

    if (!cmd) return;

    if (cmd.args && !args.length || args.length > cmd.args_length) {
		if (!cmd.hasOwnProperty('noArgsReply')) {return msg.reply(`ik mis een aantal argumenten. ${cmd.usage}`);
		}

		cmd.noArgsReply().then(reply => {
			return msg.reply(reply);
		}, err => {
			return msg.reply(err);
		});
		return;
    }

    try {
        cmd.execute(msg, args, client);
    } catch (error) {
        console.error(error);
        msg.reply('lekker bezig, bot is stuk');
    }
});

// Add role to new user
client.on('guildMemberAdd', (member) => {
    const role = member.guild.roles.cache.find(role => role.name === 'Nieuw');
    if (!role) return;
    member.roles.add(role);
    const senateChannel = member.guild.channels.cache.find(channel => channel.name === 'senaat');
    if (!senateChannel) return;
    senateChannel.send('Er is een nieuwe sukkel de server binnengekomen, geef ff role <@&906550222480605194>');
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

client.login(settings.token);

// API
const express = require('express');
const cors = require('cors');
const { channel } = require('diagnostics_channel');

const app = express();
app.use(cors());

// Check token
function tokenCheck(req, res, next) {
    if (req.headers.authorization == settings.secretKey) return next();
    
    return res.status(401).json({message: "Authorization key invalid"});
}

// Get a random quote
let c = Infinity;
let messages;
let last5 = new Array(5).fill("");
app.get('/quote', tokenCheck, async (req, res) => {
    console.log('Request on route /quote');
    if (c > 25) {
        c = 0;
        const channel = await client.channels.fetch(settings.quoteChannelID);
        messages = await channel.messages.fetch({ limit: 50 })
    } else {
        c++;
    }   

    for (let [id, message] of messages.entries()) {
        if (last5.includes(id)) continue;
        if (Math.random() < 0.05) {
            res.json({quote: message.content});
            last5.shift();
            last5.push(id);
            return;
        }
    }
    
    res.json({quote: "wie dit leest trekt bak -Das tijdens het maken van de bot (kans op dit bericht is 1 / 20^50)"});
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

// Get 15 random photos
app.get("/photo", tokenCheck, async (req, res) => {
    const channel = await client.channels.fetch(settings.photoChannelID);
    const messages = await channel.messages.fetch();

    let attachments = []

    for (let [_, message] of messages.entries()) {
        for (let [_, attachment] of message.attachments.entries()) {
            if (/.*.(png|jpg|jpeg|gif|webp|avif|apng|bmp)$/i.test(attachment.url))
                attachments.push(attachment.url);
        }
    }

    if (attachments.length <= 15) return res.json({photos: attachments});

    return res.json({photos: shuffleArray(attachments).slice(0,15)});
})

const run = async () => {
    await client.login(settings.token);
    const port = process.env.PORT || settings.PORT;
    app.listen(port);
    console.log('Listening on port ' + port);
}

run();