let Command = require('../../structures/command');
let utils = require('../../utils.js');

class Read extends Command {
    constructor({t}) {
        super();
        this.cmd = 'read';
        this.cat = 'japanese';
        this.needGuild = false;
        this.t = t;
        this.help = {
            short: 'help.read.short',
            usage: 'help.read.usage',
            example: 'help.read.example'
        }
        this.needsArguments = true;
    }

    run(msg) {
        var sentence = msg.content.split(' ');
        sentence.shift();
        sentence = sentence.join(' ').trim();
        utils.generateImageFromText(sentence, (embed) => {
            msg.channel.createMessage('', embed);
        });
    }
}
module.exports = Read;
