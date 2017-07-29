/**
 * Created by Julian on 10.05.2017.
 */
let Command = require('../../structures/command');
let winston = require('winston');

let categoriesOrder = ['japanese', 'generic', 'fun', 'image', 'music'];

class Help extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'help';
        this.aliases = ['commands', 'h', 'cmds'];
        this.cat = 'generic';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.r = mod.getMod('raven');
        this.help = {
            short: 'help.help.short',
            usage: 'help.help.usage',
            example: 'help.help.example'
        }
    }

    run(msg) {
        let args = msg.content.split(' ').splice(1);
        if (args.length > 0) {
            let cmd = args[0].trim();
            if (cmd.startsWith(msg.prefix)) {
                cmd = cmd.substring(msg.prefix.length);
            }
            let command = msg.cmds[cmd];
            if (!command) {
                if (msg.aliases[cmd]) {
                    command = msg.cmds[msg.aliases[cmd]];
                }
            }
            if (command && !command.hidden) {
                if (command.help) {
                    return msg.channel.createMessage(this.buildCommandHelp(msg, command));
                } else {
                    return msg.channel.createMessage(this.t('help.command-no-detail', {
                        lngs: msg.lang,
                        legacy_help: this.t(`help.${command.cmd}`, {lngs: msg.lang})
                    }));
                }
            } else {
                return msg.channel.createMessage(this.t('help.command-not-exists', {
                    lngs: msg.lang,
                    prefix: msg.prefix,
                    cmd
                }));
            }
        } else {
            return msg.channel.createMessage(this.buildCategoryHelp(msg, msg.cmds));
        }
    }

    /**
     * Function that builds a help message for the specific command
     * @param {Object} msg The message that triggered the help
     * @param {Object} command Command to build the help for
     * @return {String}
     */
    buildCommandHelp(msg, command) {
        let helpMessage = "";

        if (command.aliases.length > 0) {
            let aliases = command.aliases.map(a => `\`${a}\``);
            helpMessage += 'Aliases: ' + aliases.join(' ') + '\n\n';
        }
        if (command.help.short) {
            helpMessage += this.t(command.help.short, {lngs: msg.lang}) + '\n\n';
        }
        if (command.help.long) {
            helpMessage += this.t(command.help.long, {lngs: msg.lang}) + '\n';
        }

        var embed = {
            "embed": {
                "title": "`" + msg.prefix + command.cmd + "`",
                "description": helpMessage,
                "color": 7054335,
                "footer": {
                    "icon_url": "https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png",
                    "text": "github.com/Tenchi2xh/rem-v2"
                },
                "thumbnail": {
                    "url": "https://user-images.githubusercontent.com/4116708/28647479-b0eb104a-7267-11e7-9778-63becbbaa56b.png"
                },
                "fields": [
                    
                ]
            }
        };


        if (command.help.usage) {
            embed["embed"]["fields"].push({
                "name": "Usage",
                "value": "`" + this.t(command.help.usage, {lngs: msg.lang, prefix: msg.prefix}) + "`"
            });
        }
        if (command.help.example) {
            embed["embed"]["fields"].push({
                "name": "Examples",
                "value": this.t(command.help.example, {lngs: msg.lang, prefix: msg.prefix}).replace(/\n/g, '\n\n')
            });
        }

        return embed;
    }

    /**
     * Function that builds a list of commands with their categories
     * @param {Object} msg The message that triggered the help
     * @param {Object} commands Map of commands with data like category, trigger and so on
     */
    buildCategoryHelp(msg, commands) {
        var helpMessage = `**Welcome!** I am ${rem.user.username}, a social bot here on ${msg.channel.guild.name}!\n`;
        helpMessage    += "\n";

        var moreHelp = "To use a command, type `" + msg.prefix + "[command name]`\n\n";
        moreHelp    += "Some commands require *keywords* after the name,\nfor example: `" + msg.prefix + "jisho house`\n\n"
        moreHelp    += "To learn more about a specific command,\ntype: `" + msg.prefix + "help [command name]`\n\n";
        moreHelp    += "Supported commands are:\n\u200b"

        let categories = {};

        for (let key in commands) {
            if (commands.hasOwnProperty(key) && !commands[key].hidden) {
                let command = commands[key];
                if (!categories[command.cat])
                    categories[command.cat] = [];
                categories[command.cat].push(command);
            }
        }

        for (let key in categories) {
            if (categories.hasOwnProperty(key)) {
                categories[key].sort((a, b) => a.cmd > b.cmd)
            }
        }

        let sortedCategories = Object.keys(categories);
        sortedCategories.sort((a, b) => this.getCategoryRanking(a) > this.getCategoryRanking(b));

        var embed = {
            "content": helpMessage,
            "embed": {
                "title": "Help about commands",
                "description": moreHelp,
                "color": 7054335,
                "footer": {
                    "icon_url": "https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png",
                    "text": "github.com/Tenchi2xh/rem-v2"
                },
                "thumbnail": {
                    "url": "https://user-images.githubusercontent.com/4116708/28647479-b0eb104a-7267-11e7-9778-63becbbaa56b.png"
                },
                "fields": []
            }
        }

        for (let i = 0; i < sortedCategories.length; i++) {
            let category = categories[sortedCategories[i]];
            var name = this.t(`help.categories.${sortedCategories[i]}`, {lngs: msg.lang});
            name = name.slice(1, -1).toLowerCase();
            name = name[0].toUpperCase() + name.slice(1);
            embed["embed"]["fields"].push({
                "name": name,
                "value": category.map(cmd => "`" + cmd.cmd + (cmd.needsArguments?"・":"") + "`").join(' '),
                "inline": true
            });
        }

        embed["embed"]["fields"].push({"name":"\u200b", "value": "(Commands with a dot・ need keywords)"});

        return embed;
    }

    /**
     * Returns the sorting number for a ranking in help
     * @param {String} category Name of the category to be evaluated
     * @return {Number}
     */
    getCategoryRanking(category, def=0) {
        let rank = categoriesOrder.indexOf(category);
        return rank > -1 ? rank : def;
    }
}
module.exports = Help;