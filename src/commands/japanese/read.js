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
        let shadowCss = utils.generateShadow(3.2, 50);
        utils.generateImageFromText(sentence, (embed) => {
            msg.channel.createMessage('', embed);
        }, `
body {
    font-size: 45pt;
    text-shadow: ${shadowCss};
    color: rgb(191, 191, 191);
    width: 1000px;
    font-family: "Noto Sans";
    font-weight: 500;
}
rt {
    font-size: 20pt;
    font-weight: 700;
}
#text {
    padding-left: 23px;
}
`);
    }
}
module.exports = Read;
