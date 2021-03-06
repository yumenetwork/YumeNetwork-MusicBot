const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

const config = require('./data/config.js');
const core = require('./yume_modules/core.js');

var player = {};

fs.readdir(__dirname+"/events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
            let eventFunction = require(`./events/${file}`);
            let eventName = file.split(".")[0];
            bot.on(eventName, (...args) => eventFunction.run(bot, ...args, config));
    });
});

bot.on('message', (message) => {

    if(message.author.bot || !message.member || message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    try {
        var commandFile = require(`./commandes/${command}.js`);
        commandFile.run(bot, message, command, args, config, player);
    } catch (error) {
        if(error.code !== "MODULE_NOT_FOUND"){
            message.channel.send(core.erroriMsg("Execute command "+config.prefix+command, error.message));
            console.log(error);
        }
    }

});

bot.on('error', (error) => {
    console.log(error);
});

bot.login(config.token);

process.on('SIGINT', () => {
    bot.destroy()
    process.exit(0)
});