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
        }, `
body {
    font-size: 45pt;
    width: 1000px;
    font-family: "Noto Sans";
    background: -webkit-radial-gradient(100% 150%, circle, rgb(165,207,249) 24%, #FFFFFF 25%, #FFFFFF 28%, rgb(165,207,249) 29%, rgb(165,207,249) 36%, #FFFFFF 36%, #FFFFFF 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 100%), -webkit-radial-gradient(0 150%, circle, rgb(165,207,249) 24%, #FFFFFF 25%, #FFFFFF 28%, rgb(165,207,249) 29%, rgb(165,207,249) 36%, #FFFFFF 36%, #FFFFFF 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 100%), -webkit-radial-gradient(50% 100%, circle, #FFFFFF 10%, rgb(165,207,249) 11%, rgb(165,207,249) 23%, #FFFFFF 24%, #FFFFFF 30%, rgb(165,207,249) 31%, rgb(165,207,249) 43%, #FFFFFF 44%, #FFFFFF 50%, rgb(165,207,249) 51%, rgb(165,207,249) 63%, #FFFFFF 64%, #FFFFFF 71%, rgba(0,0,0,0) 71%, rgba(0,0,0,0) 100%), -webkit-radial-gradient(100% 50%, circle, #FFFFFF 5%, rgb(165,207,249) 6%, rgb(165,207,249) 15%, #FFFFFF 16%, #FFFFFF 20%, rgb(165,207,249) 21%, rgb(165,207,249) 30%, #FFFFFF 31%, #FFFFFF 35%, rgb(165,207,249) 36%, rgb(165,207,249) 45%, #FFFFFF 46%, #FFFFFF 49%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%), -webkit-radial-gradient(0 50%, circle, #FFFFFF 5%, rgb(165,207,249) 6%, rgb(165,207,249) 15%, #FFFFFF 16%, #FFFFFF 20%, rgb(165,207,249) 21%, rgb(165,207,249) 30%, #FFFFFF 31%, #FFFFFF 35%, rgb(165,207,249) 36%, rgb(165,207,249) 45%, #FFFFFF 46%, #FFFFFF 49%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%), rgb(165, 207, 249);
    background-size: 50px 25px;
    font-weight: 900;
}
rt {
    font-size: 20pt;
    font-weight: 700;
}
#text {
    color: white;
    -webkit-text-stroke: 0.5px black;
    text-align: center; 
    padding: 3px;
}
#text, ruby, rt, rb {
    background-color: #026873;
    background-image: linear-gradient(90deg, rgba(255,255,255,.07) 50%, transparent 50%), linear-gradient(90deg, rgba(255,255,255,.13) 50%, transparent 50%), linear-gradient(90deg, transparent 50%, rgba(255,255,255,.17) 50%), linear-gradient(90deg, transparent 50%, rgba(255,255,255,.19) 50%);
    background-size: 13px, 29px, 37px, 53px;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
`);
    }
}

module.exports = Challenge; 