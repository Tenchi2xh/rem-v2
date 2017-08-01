let Command = require('../../structures/command');
var utils = require('../../utils.js');
class Challenge extends Command {
    constructor({ t }) {
        super();
        this.cmd = 'challenge';
        this.cat = 'japanese';
        this.needGuild = false;
        this.accessLevel = 2;
        this.hidden = true;
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
        }, `
body {
    font-size: 45pt;
    width: 1000px;
    font-family: "Noto Sans";
    font-weight: 400;
    margin: 0;
    padding: 0;
    text-shadow: ${shadowCss};
    background: black;
}
rt {
    font-size: 20pt;
    font-weight: 700;
}
#text {
    color: white;
    -webkit-text-stroke: 0.5px black;
    text-align: center; 
    padding: 3px
    position: relative;
    bottom: 0;
}
#text img {
    position: absolute;
    z-index: -1;
    left: 0;
    top: 0;
}
#text #furi {
    background: rgba(0, 0, 0, .5);
    position: absolute;
    width: 100%;
    bottom: 0;
}
`, "<img src='pexels-photo-209798.jpeg'><br />");
    }
}

module.exports = Challenge; 