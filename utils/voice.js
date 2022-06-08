module.exports = {
    /**
     * Joins the voicechannel for given context,
     * @returns a voice connection
     */
    join: async msg => {
        if (!msg.member.voice.channel) msg.channel.send('Je bent niet in een voice kanaal')
        return await msg.member.voice.channel.join();
    },

    /**
     * Leaves the voice channel
     */
    leave: async msg => {
        await msg.guild.voice.channel.leave();
    },

    /**
     * Leaves the voice channel and destroys the dispatcher
     */
    finish: (msg, dispatcher) => {
        console.log('finished playing')
        module.exports.leave(msg);
        dispatcher.destroy();
    },

    /**
     * Returns a boolean if the bot is playing music in the given context
     */
    playing: (msg, client) => {
        return !!client.dispatchers[msg.guild.id]; // Deze syntax moeten we koesteren (!! cast m naar een bool)
    }
}