let Command = require('../../structures/command');
let request = require('request');


function jishoEmbed(keyword, result, more) {
    var embed = {
        'embed': {
            'title': 'Result for “' + keyword + '”',
            'url': 'http://jisho.org/search/' + encodeURIComponent(keyword),
            'color': 5160000,
            'timestamp': (new Date()).toISOString(),
            'footer': {
                'text': 'Results provided by jisho.org'
            },
            'thumbnail': {
                'url': 'http://assets.jisho.org/assets/jisho-logo-v4@2x-7330091c079b9dd59601401b052b52e103978221c8fb6f5e22406d871fcc746a.png'
            },
            'author': {
                'name': 'Jisho',
                'url': 'http://jisho.org',
                'icon_url': 'http://assets.jisho.org/assets/jisho-logo-v4@2x-7330091c079b9dd59601401b052b52e103978221c8fb6f5e22406d871fcc746a.png'
            },
            'fields': [
                {
                    'name': '',
                    'value': ''
                }
            ]
        }
    };

    // <kanji word> 【<reading>】
    if ('word' in result['japanese'][0]) {
        embed['embed']['fields'][0]['name'] = result['japanese'][0]['word'] + '【' + result['japanese'][0]['reading'] + '】';
    } else {
        embed['embed']['fields'][0]['name'] = result['japanese'][0]['reading'];
    }

    embed['embed']['fields'][0]['value'] += result['is_common'] ? '(common word) ' : '';

    // The type of word is contained in the first set of senses of a result (Noun, Adjective etc.)
    if (result['senses'][0]['parts_of_speech'].length > 0) {
        embed['embed']['fields'][0]['value'] += '*' + result['senses'][0]['parts_of_speech'].join(', ') + '*';
    }

    // Crop results
    if (result['senses'].length > 5) {
        result['senses'].splice(5);
        embed['embed']['description'] = '*This word has too many meanings*\n*Please visit the [Jisho result page](http://jisho.org/search/' + encodeURIComponent(keyword) + ') for more information*';
    }

    // Add all meanings. A Discord embed field MUST have both a title and a value,
    // that cannot be empty, and most whitespace characters won't do the tric except \u200b
    for (var i = 0; i < result['senses'].length; ++i) {
        var tags = (result['senses'][i]['tags'] && result['senses'][i]['tags'].length > 0) ? ' (' + result['senses'][i]['tags'].join(', ') + ')' : '';
        embed['embed']['fields'].push({
            'name': (i + 1) + '. ' + result['senses'][i]['english_definitions'].splice(0, 1),
            'value': '\u200b' + result['senses'][i]['english_definitions'].join('; ') + tags,
            'inline': true
        });
    }

    if (more > 0) {
        var plural = (more == 2) ? '' : 's';
        embed['embed']['fields'].push({
            'name': '\u200b',
            'value': '(' + (more - 1) + ' other result' + plural + ': use `!w.jisho [number] query`)'
        });
    }

    return embed;
}

class Jisho extends Command {
    constructor({t}) {
        super();
        this.cmd = 'jisho';
        this.cat = 'japanese';
        this.needGuild = false;
        this.t = t;
        this.help = {
            short: 'help.jisho.short',
            usage: 'help.jisho.usage',
            example: 'help.jisho.example'
        };
        this.needsArguments = true;
    }

    run(msg) {
        // Index is 1 based for better human interaction
        var index = 1;

        var keyword = msg.content.split(' ');
        keyword.shift();

        // Check if first word said is a result index (i.e. an integer)
        index = parseInt(keyword[0]);
        if (isNaN(index)) {
            index = 1;
        } else {
            keyword.shift();
        } 

        keyword = keyword.join(' ').trim();
        if (keyword === '') return msg.channel.createMessage(this.t('generic.empty-search', {lngs: msg.lang}));

        request.get(
            'http://jisho.org/api/v1/search/words',
            {'qs': {'keyword': keyword}},
            (error, response, body) => {
                if (error) {
                    msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
                    return;
                }
                if (!error && response.statusCode === 200) {
                    try {
                        body = JSON.parse(body)['data'];
                    } catch (e) {
                        msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
                        return;
                    }
                    if (typeof body !== 'undefined') {
                        index = index - 1;
                        if (body.length > 0 && index < body.length && index >= 0) {
                            let more = index < body.length - 1 ? body.length : 0;
                            msg.channel.createMessage(jishoEmbed(keyword, body[index], more));
                            return;
                        }
                    }

                    msg.channel.createMessage(this.t('search.no-results', {lngs: msg.lang}));
                }
            });
    }
}

module.exports = Jisho;
