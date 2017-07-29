let Command = require('../../structures/command');
const phantom = require('phantom');
const fs = require('fs');
let cp = require('child_process');
let StringDecoder = require('string_decoder').StringDecoder;

function katakanaToHiragana(input = '') {
    const HIRAGANA_START = 0x3041;
    const KATAKANA_START = 0x30A1;
    const KATAKANA_END = 0x30FC;
    var hira = '';
    for (var letter of input) {
        var code = letter.charCodeAt(0);
        if (code >= KATAKANA_START && code <= KATAKANA_END)
            code = code + (HIRAGANA_START - KATAKANA_START);
        hira += String.fromCharCode(code);
    }
    return hira;
}

function slice(string, start, end, step) { // a proper substr
    var slice = string.slice, sliced = slice.call(string, start, end),
        result, length, i;

    if (!step) {
        return sliced;
    }
    result = [];
    length = sliced.length;
    i = (step > 0) ? 0 : length - 1;
    for (; i < length && i >= 0; i += step) {
        result.push(sliced[i]);
    }
    return result;
}
function furiToRb(kanji, reading) {
    if (kanji == reading)
        return reading;
    if (kanji == 'だ' && reading == "で")
        return "だ";
    var furigana = '';
    var placeLeft = 0
    var placeRight = 0
    var lastKanji = kanji.length;
    var lastReading = reading.length;
    var j = 0;
    for (var i = 0; i < kanji.length; i++) {
        placeRight = i;
        j = i + 1;
        if (kanji[lastKanji - j] != reading[lastReading - j])
            break;
    }
    for (var i = 0; i < kanji.length; i++) {
        placeLeft = i
        if (kanji[i] != reading[i])
            break;
    }
    var before = '';
    var after = '';
    var ruby = '';
    var rt = '';
    if (placeLeft == 0) {
        if (placeRight == 0) {
            ruby = kanji;
            rt = reading;
        } else {
            ruby = slice(kanji, 0, lastKanji - placeRight);
            rt = slice(reading, 0, lastReading - placeRight);
            after = slice(reading, lastReading - placeRight);
        }
    } else {
        if (placeRight == 0) {
            before = slice(reading, 0, placeLeft);
            ruby = slice(kanji, placeLeft);
            rt = slice(reading, placeLeft);
        } else {
            before = slice(reading, 0, placeLeft);
            ruby = slice(kanji, placeLeft, lastKanji - placeRight);
            rt = slice(reading, placeLeft, lastReading - placeRight);
            after = slice(reading, lastReading - placeRight);
        }
    }
    return `${before}<ruby><rb>${ruby}</rb><rt>${rt}</rt></ruby>${after}`
}

function mecab(input, callback) {
    let decoder = new StringDecoder('utf8');
    var c = cp.spawn('mecab', []);

    c.stdin.write(input + '\n');
    c.stdout.on('data', data => {
        callback(decoder.write(data));
    });
    c.stdin.end();
}

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
        var code = `<!Doctype html>
<html>
    <head>
        <style>
            body {
                font-size: 45pt;
                text-shadow: -1px -1px 0 rgba(0, 0, 0, .75), 1px -1px 0 rgba(0, 0, 0, .75), -1px 1px 0 rgba(0, 0, 0, .75), 1px 1px 0 rgba(0, 0, 0, .75);
                color: rgba(255, 255, 255, .75);
                width: 1000px;
                font-family: "Noto Sans";
            }
            rt {
                font-size: 20pt;
                font-weight: 700;
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
                    furi += furiToRb(original, katakanaToHiragana(cols[8]));
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
                await page.property('clipRect', { top: 0, left: 0, width: rect.width, height: rect.bottom });
                await page.render('out.png').then(() => {
                    msg.channel.createMessage('', {
                        "file": new Buffer(fs.readFileSync('out.png')),
                        "name": "out.png"
                    });
                });
                await instance.exit();
            })();
        });
    }
}
module.exports = Read;
