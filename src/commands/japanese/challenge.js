let Command = require('../../structures/command');
var utils = require('../../utils.js');
class Challenge extends Command {
    constructor({ t }) {
        super();
        this.cmd = 'challenge';
        this.cat = 'japanese';
        this.needGuild = false;
        this.t = t;
        this.help = {
            short: 'help.challenge.short',
            usage: 'help.challenge.usage',
            example: 'help.challenge.example'
        }
        this.needsArguments = true;
    }

    run(msg) {
        var sentence = msg.content.split(' ');
        sentence.shift();
        sentence = sentence.join(' ').trim();
        msg.delete();   
        let shadowCss = utils.generateShadow(3.2, 50);
        utils.generateImageFromText(sentence, (embed) => {
            msg.channel.createMessage('<@&341001978236764172> ~~ Can you solve today\'s challenge? (^o^)丿', embed);
        });
    }
}

module.exports = Challenge; 