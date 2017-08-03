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
        this.needsArguments = false;
    }

    async askFor(msg, topic) {
        let questionMessage = await msg.channel.createMessage(topic);
        let collector = msg.CON.addCollector(msg.channel.id, {
            filter: (collectorMsg) => {
                return collectorMsg.author.id === msg.author.id;
            },
            max: 1
        });
        return new Promise((resolve, reject) => {
            collector.on('end', () => {
                questionMessage.delete();
                collector.collected.forEach(value => { // max is 1 so it'll only run once and this is the only way to iterate through a js map
                    value.delete();
                    resolve(value.content);
                });
            })
        });
    }

    async endChallenge(con, channel, author) {
        let points = [];
        let collector = con.addCollector(channel.id, {
            filter: (collected) => {
                return collected.author.id === author;
            },
        });
        const okMessage = "Correct! ";
        const stopMessage = "STOP!!";
        collector.on('message', async (msg) => {
            if(msg.content.substr(0, okMessage.length) == okMessage) {
                points.push(msg.content.substr(okMessage.length));
                msg.delete();
            }
            if(msg.content.substr(0, stopMessage.length) == stopMessage) {
                let dmChannel = await msg.author.getDMChannel();
                msg.delete();
                await dmChannel.createMessage("Challenge ended: Points given to: \n"+points.join('\n'));
                collector.stop();
                channel.delete();
            }
        })
    }

    async run(msg) {
        let topic = await this.askFor(msg, "What's the topic of this challenge?");
        let text = await this.askFor(msg, "What's the text to translate?");
        var channel = await msg.channel.guild.createChannel('challenge', 0, 'Translation Challenge ' + (new Date()));
        let shadowCss = utils.generateShadow(3.2, 50);
        utils.generateImageFromText(text, async (embed) => {
            let collectorMsg = await channel.createMessage(`<@&341001978236764172> ~~ ${topic}\n Can you solve it? (^o^)丿`, embed);
            this.endChallenge(msg.CON, channel, msg.author.id);
            msg.delete();
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