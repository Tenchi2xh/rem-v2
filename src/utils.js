let cp = require('child_process');
let StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const phantom = require('phantom');

module.exports = class utils {
    static katakanaToHiragana(input = '') {
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
    
    static slice(string, start, end, step) { // a proper substr
        var slice = string.slice, sliced = slice.call(string, start, end), result, length, i;
        if (!step)
            return sliced;
        result = [];
        length = sliced.length;
        i = (step > 0) ? 0 : length - 1;
        for (; i < length && i >= 0; i += step) {
            result.push(sliced[i]);
        }
        return result.join('');
    }
    
    static furiToRb(kanji, reading) {
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
                ruby = utils.slice(kanji, 0, lastKanji - placeRight);
                rt = utils.slice(reading, 0, lastReading - placeRight);
                after = utils.slice(reading, lastReading - placeRight);
            }
        } else {
            if (placeRight == 0) {
                before = utils.slice(reading, 0, placeLeft);
                ruby = utils.slice(kanji, placeLeft);
                rt = utils.slice(reading, placeLeft);
            } else {
                before = utils.slice(reading, 0, placeLeft);
                ruby = utils.slice(kanji, placeLeft, lastKanji - placeRight);
                rt = utils.slice(reading, placeLeft, lastReading - placeRight);
                after = utils.slice(reading, lastReading - placeRight);
            }
        }
        return `${before}<ruby><rb>${ruby}</rb><rt>${rt}</rt></ruby>${after}`
    }

    static mecab(input, callback) {
        let decoder = new StringDecoder('utf8');
        var c = cp.spawn('mecab', []);

        c.stdin.write(input + '\n');
        c.stdout.on('data', data => {
            callback(decoder.write(data));
        });
        c.stdin.end();
    }

    static generateShadow(thickness, steps, useTransparency = false) {
        var step = 2 * Math.PI / steps;
        var coords = [];
        var color = useTransparency ? 'rgba(0, 0, 0, .7)' : 'black';
        for (var i = 0; i < steps; ++i) {
            var x = (thickness * Math.cos(i * step)).toFixed(2);
            var y = (thickness * Math.sin(i * step)).toFixed(2)
            coords.push(`${x}px ${y}px 0 ${color}`);
        }
        return coords.join(", ");
    }

    static async generateImageFromText(sentence, callback, css = '') {
        var code = `<!Doctype html>
<html>
    <head>
        <style>
            ####css####
        </style>
        <meta charset="utf8">
    </head>
    <body>
        <div id='textContainer'>
            <div id="text">
                ####furigana####
            </div>
        </div>
    </body>
</html>`;
        if (sentence === '') return msg.channel.createMessage(this.t('generic.empty-search', { lngs: msg.lang }));
        if(css == '') {
            let shadowCss = utils.generateShadow(3.2, 50);
            css = `
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
    padding: 3px 3px 3px 23px;
}`;
        }
        console.log(sentence);
        sentence = sentence.replace(/\n/g, 'NEWLINE');
        utils.mecab(sentence, (stdout) => {
            var rows = stdout.split("\n");
            var furi = '';
            var out = [];
            for (var row of rows) {
                row = row.split("\t");
                const original = row[0];
                let cols = row[1];
                if (typeof cols === 'undefined')
                    continue;
                cols = cols.split(',');
                const isText = (original.match(/([A-Za-z0-9]+)$/) !== null);
                const isHiraKata = (original.match(/^([\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]+)$/) !== null);
                if(isText && original == "NEWLINE")
                    furi += '<br />';
                else if (isText || isHiraKata)
                    furi += original;
                else
                    furi += utils.furiToRb(original, utils.katakanaToHiragana(cols[7]));
                out.push(cols);
            }
            fs.writeFileSync('furi.html', code.replace('####css####', css).replace('####furigana####', furi));
            (async function () {
                const instance = await phantom.create();
                const page = await instance.createPage();
                await page.open('furi.html');
                var rect = await page.evaluate(function () {
                    return document.getElementById('text').getBoundingClientRect();
                });
                await page.property('clipRect', { top: rect.top, left: rect.left, width: rect.width, height: rect.height });
                await page.render('out.png').then(() => {
                    let embed = {
                        "file": new Buffer(fs.readFileSync('out.png')),
                        "name": "reading.png"
                    };
                    callback(embed);
                });
                await instance.exit();
            })();
        });
    }
}