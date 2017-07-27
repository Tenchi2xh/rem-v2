let Command = require('../../structures/command');
const phantom = require('phantom');
const fs = require('fs');
const { exec } = require('child_process');
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

	}

	run(msg) {
		var outside = this;
		var sentence = msg.content.split(' ');
		sentence.shift();
		sentence = sentence.join(' ').trim();
		var code = `<!Doctype html>
<html>
	<head>
		<style>
			body {
				font-size: 45pt;
				text-shadow:
					-1px -1px 0 black,
					1px -1px 0 black,
					-1px 1px 0 black,
					1px 1px 0 black;
				color: white;
				width: 1000px;
				font-family: "Noto Sans";
			}
			rt {
				font-size: 16pt;
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

		exec('echo "' + sentence + '" | mecab -F"[%M	%FC[7]], " -E" "', (err, stdout, stderr) => {
			var rows = stdout.split('], ');
			var furi = '';
			console.log(rows);
			for (var row of rows) {
				row = row.substr(1, row.length - 1).split("\t");
				if (row[0] === '')
					continue;
				if (row[0].match(/[\x3400-\x4DB5\x4E00-\x9FCB\xF900-\xFA6A]/g))
					furi += row[0];
				else
					furi += furiToRb(row[0], katakanaToHiragana(row[1]));
			}
			fs.writeFileSync('furi.html', code.replace('####furigana####', furi));
			(async function () {
				const instance = await phantom.create();
				const page = await instance.createPage();
				await page.open('furi.html');
				var rect = page.evaluate(function () {
					return document.getElementById('text').getBoundingClientRect();
				});
				page.property('clipRect', { top: 0, left: 0, width: rect.right - rect.left, height: rect.bottom - rect.top });
				page.render('out.png');
				await instance.exit();
				msg.channel.createMessage('', {
					"file": new Buffer(fs.readFileSync('out.png')),
					"name": "out.png"
				});
			})();
		});
	}
}
module.exports = Read;
