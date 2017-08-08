let Command = require('../../structures/command');

let pnfs = require("pn/fs");
let fs = require("fs");

var files = fs.readdirSync("../kanji/");
var dictionary = JSON.parse(fs.readFileSync("../kanji/kanji.json"));

function kanjiEmbed(entry) {
    var meanings = [];
    for (var i = 0; i < entry["meanings"].length; ++i) {
        var meaning = entry["meanings"][i];
        if (!meaning["m_lang"]) {
            meanings.push(meaning["meaning"]);
        }
    }
    var strokes = entry["stroke_count"] + " stroke" + (entry["stroke_count"] > 1 ? "s" : "");
    var jlpt = entry["jlpt"] ? "`JLPT N" + entry["jlpt"] + "` ": " ";
    var grade = entry["grade"] ? "`Grade " + entry["grade"] + "`": "";
    var embed = {
        "embed": {
            "title": meanings.join("; "),
            "description": strokes + "\n" + jlpt + grade,
            "color": 16044806,
            "footer": {
                "text": "Information taken from KANJIDIC2 by the EDRDG"
            },
            "thumbnail": {
                "url": "attachment://reading.gif"
            },
            "author": {
                "name": entry["literal"]
            },
            "fields": []
        }
    };
    var kun = [];
    var on = [];
    for (var i = 0; i < entry["readings"].length; ++i) {
        var reading = entry["readings"][i];
        if (reading["r_type"] == "ja_kun") {
            kun.push(reading["reading"]); 
        } else if (reading["r_type"] == "ja_on") {
            on.push(reading["reading"]);
        }
    }
    if (kun.length > 0) {
        embed["embed"]["fields"].push({"name": "Kun:", "value": kun.join(", "), "inline": true});
    }
    if (on.length > 0) {
        embed["embed"]["fields"].push({"name": "On:", "value": on.join(", "), "inline": true});
    }
    return embed;
}

class Kanji extends Command {
    constructor({t}) {
        super();
        this.cmd = 'kanji';
        this.cat = 'japanese';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.needsArguments = true;
    }

    run(msg) {
        let words = msg.content.split(' ').splice(1);
        if (words.length == 0 || words.length > 1 || words[0].length > 1) {
            msg.channel.createMessage(":x: Please query for exactly one character.");
            return;
        }
        
        var kanji = words[0][0];
        var kanjiFile = "0" + words[0].charCodeAt(0).toString(16) + "_anim.gif";

        if (!(files.includes(kanjiFile))) {
            msg.channel.createMessage(":x: Kanji not found or not a kanji.");
            return;
        }

        let message = (dictionary[kanji]) ? kanjiEmbed(dictionary[kanji]) : "";

        pnfs.readFile("../kanji/" + kanjiFile)
            .then(buffer => msg.channel.createMessage(message , {
                "file": buffer,
                "name": "reading.gif"
            }))
            .catch(e => console.error(e));
    }
}
module.exports = Kanji;
