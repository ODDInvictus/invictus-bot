const fs = require('fs');
const settings = require('./settings.json');
const fetchAll = require('discord-fetch-all')

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('message', msg => {
    if (msg.author.bot) return; // Sender is the bot
    if (msg.channel.id == settings.quoteChannelID) return; // Quote chnnel

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
    if (role) member.roles.add(role);

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

const app = express();
app.use(cors());

// Check token
function tokenCheck(req, res, next) {
    if (req.headers.authorization == settings.secretKey) return next();
    
    return res.status(401).json({message: "Authorization key invalid"});
}

// Quotes
let c = Infinity;
let messages;
let recentQuotes = new Array(40).fill("");

app.get('/quote', tokenCheck, async (req, res) => {
    if(await fetchQuotes(res)) return;
    sendQuote(res);   
});

async function fetchQuotes(res) {
    // Every 50 request fetch the quotes again from discord
    if (c > 50) {
        let responded = false;
        if (messages) {
            sendQuote(res);
            responded = true;
        }

        c = 0;
        const channel = await client.channels.fetch(settings.quoteChannelID);
        // Dit is mokertje traag
        messages = (await fetchAll.messages(channel, {
            reverseArray: false, // Reverse the returned array
            userOnly: true, // Only return messages by users
            botOnly: false, // Only return messages by bots
            pinnedOnly: false, // Only returned pinned messages
        }));
        return responded;
    } else {
        c++;
        return false;
    }
}

function sendQuote(res) {
    if (c==0) return res.json({
        quote: messages[Math.floor(Math.random() * (messages.length-300)) + 300].content
    });
    // Respond with a random quote
    for (let [id, message] of messages.entries()) {
        // Filter on only default messages (so no treads)
        if (message.type !== "DEFAULT") continue;
        // Filter if the quote has recently been send
        if (recentQuotes.includes(id)) continue;
        // Change of 2% to send the quote
        if (Math.random() < 0.02) {
            // Send the quote
            res.json({quote: message.content});
            // Update the recent quotes
            recentQuotes.shift();
            recentQuotes.push(id);
            return;
        }
    }
    // Default if no quote is chosen
    return res.json({quote: "Wie dit leest trekt bak, de kans op dit bericht is ongeveer 0%"}); 
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

// Get random photos
app.get("/photo", tokenCheck, async (req, res) => {
    const channel = await client.channels.fetch(settings.photoChannelID);
    const messages = await channel.messages.fetch();
    const size = 25;

    let attachments = []

    for (let [_, message] of messages.entries()) {
        for (let [_, attachment] of message.attachments.entries()) {
            if (/.*.(png|jpg|jpeg|gif|webp|avif|apng|bmp)$/i.test(attachment.url))
                attachments.push(attachment.url);
        }
    }

    if (attachments.length <= size) return res.json({photos: attachments});

    return res.json({photos: shuffleArray(attachments).slice(0,size)});
})

const run = async () => {
    await client.login(settings.token);
    const port = process.env.PORT || settings.PORT;
    app.listen(port);
    console.log('Listening on port ' + port);
}

run();