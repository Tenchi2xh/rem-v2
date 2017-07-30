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
<<<<<<< HEAD
        utils.generateImageFromText(sentence, (embed) => {
            msg.channel.createMessage('', embed);
=======
        var code = `<!Doctype html>
<html>
    <head>
        <style>
            body {
                font-size: 45pt;
                text-shadow: ${shadowCss};
                color: rgb(191, 191, 191);
                width: 1000px;
                font-family: "Noto Sans";
            }
            rt {
                font-size: 20pt;
                font-weight: 700;
            }
            #text {
                padding-left: 20px;
            }
        </style>
        <meta charset="utf8">
    </head>
    <body>
        <div id="text">
            ####furigana####
        </div>
    </body>
</html>`;

        if (sentence === '') return msg.channel.createMessage(this.t('generic.empty-search', {lngs: msg.lang}));

        mecab(sentence, (stdout) => {
            var rows = stdout.split("\n");
            var furi = '';
            var out = [];
            for(var row of rows) {
                row = row.split("\t");
                const original = row[0];
                let cols = row[1];
                if(typeof cols === 'undefined')
                    continue;
                cols = cols.split(',');
                const isText = (original.match(/([A-Za-z0-9]+)$/) !== null);
                const isHiraKata = (original.match(/^([\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]+)$/) !== null);
                if (isText || isHiraKata)
                    furi += original;
                else
                    furi += furiToRb(original, katakanaToHiragana(cols[7]));
                out.push(cols);
            }
            fs.writeFileSync('furi.html', code.replace('####furigana####', furi));
            (async function () {
                const instance = await phantom.create();
                const page = await instance.createPage();
                await page.open('furi.html');
                var rect = await page.evaluate(function () {
                    return document.getElementById('text').getBoundingClientRect();
                });
                await page.property('clipRect', { top: rect.top, left: rect.left, width: rect.width, height: rect.height });
                await page.render('out.png').then(() => {
                    msg.channel.createMessage('', {
                        "file": new Buffer(fs.readFileSync('out.png')),
                        "name": "reading.png"
                    });
                });
                await instance.exit();
            })();
>>>>>>> refs/remotes/origin/master
        });
    }
}
module.exports = Read;
