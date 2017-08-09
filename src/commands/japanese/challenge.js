let Command = require('../../structures/command');
let utils = require('../../utils.js');
const quizModel = require('../../DB/quizAnswers.js');
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

    endTimer(remaining) {
        remaining = remaining / 1000;
        var hrs = Math.floor(remaining / 3600);
        var mins = Math.floor((remaining % 3600) / 60);
        var secs = Math.floor(remaining % 60);
        var ret = "";

        if (hrs > 0)
            ret += hrs + "h " + (mins < 10 ? "0" : "");

        ret += mins + " min " + (secs < 10 ? "0" : "");
        ret += secs + "s";

        return ret;
    }

    async endChallenge(con, channel, author, duration) {
        let answers = {};
        let collector = con.addCollector(channel.id);
        let timerMessage = await channel.createMessage('Challenge started');
        const updateMessage = () => {
            timerMessage.edit('The challenge will end in: ' + this.endTimer(timeEndFixed - new Date().getTime()));
        };
        const timeEndFixed = new Date().getTime() + (duration * 1000);
        const stopMessage = "STOP!!";
        const interval = setInterval(updateMessage, 2000);
        const doStop = function() {
            collector.stop();
            channel.createMessage('Challenge ended. Answers: ');
            for (var user in answers) {
                if (answers.hasOwnProperty(user))
                    channel.createMessage(`<@!${user}>: ${answers[user]}`);
            }
            clearTimeout(interval);
        };
        setTimeout(doStop, duration * 1000);
        updateMessage();
        collector.on('message', async (msg) => {
            if (msg.author.id === author) {
                if(msg.content.substr(0, stopMessage.length) == stopMessage) {
                    doStop();
                    msg.delete();
                    return;
                }
            }
            if(!answers.hasOwnProperty(msg.author.id)) {
                let dmChannel = await msg.author.getDMChannel();
                var botMsg = await channel.createMessage(`<@!${msg.author.id}> Thank you for your answer, please confirm in the PMs.`);
                await dmChannel.createMessage(`Your last answer was: ${msg.content}. To accept say YES.`)
                let pmCollector = con.addCollector(dmChannel.id);
                let answerForUser = msg.content;
                pmCollector.on('message', async(pmmsg) => {
                    if (pmmsg.content !== 'YES') {
                        dmChannel.createMessage(`Ok, I changed your answer to ${pmmsg.content} is that ok? If so, type YES.`);
                        answerForUser = pmmsg.content;
                    } else {
                        dmChannel.createMessage('Thank you for your answer. The results will be out shortly');
                        answers[pmmsg.author.id] = answerForUser;
                        let quizAnswer = new quizModel({
                            id: pmmsg.id,
                            date: Date.now(),
                            answer: answerForUser,
                            user: pmmsg.author.id,
                            quizId: msg.id
                        });
                        quizAnswer.save((err) => {
                            if (err) return winston.error(err);
                            botMsg.edit(`<@!${msg.author.id}> submitted an answer.`)
                        });
                        pmCollector.stop();
                    }
                });
            }
            msg.delete();
        })
    }

    async run(msg) {
        let topic = await this.askFor(msg, "What's the topic of this challenge?");
        let text = await this.askFor(msg, "What's the text to translate?");
        let duration = await this.askFor(msg, "How long should the challenge last? (seconds)");
        var channel = await msg.channel.guild.createChannel('challenge', 0, 'Translation Challenge ' + (new Date()));
        channel.editPermission(msg.channel.guild.roles.find(x => x.name == '@everyone').id, 1024 | 2048 | 65536, 0, "role", "Change permissions for the challenge.");
        let shadowCss = utils.generateShadow(3.2, 50);
        utils.generateImageFromText(text, async (embed) => {
            await channel.createMessage(`<@&341001978236764172> ~~ ${topic}\n Can you solve it? (^o^)丿`, embed);
            this.endChallenge(msg.CON, channel, msg.author.id, duration);
            msg.delete();
        }, `
body {
    font-size: 35pt;
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