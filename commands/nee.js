const voice = require('../utils/voice');
const settings = require('../settings.json');

module.exports = {
    name: 'nee',
    description: 'Laat de bot stoppen met zingen',
    args: false,
    usage: `${settings.prefix}nee`,
    execute: async (msg, args) => {
        await voice.leave(msg);
    }
}