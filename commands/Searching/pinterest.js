'use strict';

import _ from 'lodash';

export default {
    views: ['pinterest < query >'], // view for message in  menu
    command: /^s?pin(|search|terest)$/i, //another command.
    description: 'Searching Image From Pinterest',
    query: true,
    text: true,
    usage: '%cmd% abstarct',
    execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, getMessage, parseResult, addHitCommand, getJson, host, apikeys }) => {
        try {
            const data = await getJson(`${host}/api/search/pinterest?query=${query}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'Pinterest Searching');
            await waitingMessage(m.chat);
            const randomResult = _.sample(data.result);
            const parseCaption = parseResult(randomResult);
            const caption = styleMessage('Pinterest Searching', parseCaption);
            addHitCommand('Pinterest Searching', true);
            return xcoders.sendMessage(m.chat, { image: { url: randomResult.url }, caption, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Pinterest Searching');
        }
    }
};