let Command = require('../../structures/command');
let adminId = remConfig.owner_id;

class FakeKick extends Command {
    constructor({mod}) {
        super();
        this.cmd = 'kck';
        this.cat = 'admin';
        this.needGuild = false;
        this.accessLevel = 2;
        this.hidden = true;
        this.hub = mod.getMod('hub');
    }

    run(msg) {
        if (msg.author.id === adminId) {
            let recipient = msg.content.split(' ').splice(1)[0];
            let id = recipient.substring(2, recipient.length - 1);
            let user = msg.channel.guild.members.find(m => m.user.id === id);
            msg.channel.createMessage(`**${user.username}#${user.discriminator}** has left ${msg.channel.guild.name}.`);
        }
    }
}
module.exports = FakeKick;
